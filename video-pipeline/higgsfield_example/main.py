"""Higgsfield Seedance 2.5 text-to-video smoke test.  BILLABLE: one 5 s / 720p generation.

Credentials: HF_KEY=<key-id>:<key-secret> in the environment or in higgsfield_example/.env.local (git-ignored).
They are read by the SDK at runtime and never printed or logged here.
Run:  ../.venv/bin/python higgsfield_example/main.py
"""
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env.local"))  # a real environment variable still wins

import higgsfield_client
from higgsfield_client import NSFW, Cancelled, Completed, CredentialsMissedError, Failed, InsufficientCreditsError

MODEL = "bytedance/seedance-2.5/text-to-video"
ARGS = {"prompt": "A cinematic scene at sunset", "duration": 5, "resolution": "720p", "aspect_ratio": "16:9"}
BAD = {Failed: "failed", NSFW: "was blocked by moderation (NSFW)", Cancelled: "was canceled"}


def find_url(node):
    """First http(s) URL under a `url` key anywhere in the result."""
    if isinstance(node, dict):
        u = node.get("url")
        if isinstance(u, str) and u.startswith("http"):
            return u
        for v in node.values():
            if (found := find_url(v)):
                return found
    elif isinstance(node, list):
        for v in node:
            if (found := find_url(v)):
                return found
    return None


def fail(msg):
    print("FAILED:", msg, file=sys.stderr)
    return 1


def main():
    last = {"status": None}

    def on_update(status):
        last["status"] = status
        print("status:", type(status).__name__)

    try:
        result = higgsfield_client.subscribe(MODEL, arguments=ARGS, on_enqueue=lambda rid: print("request id:", rid), on_queue_update=on_update)
    except CredentialsMissedError:
        return fail("HF_KEY is not set. Put HF_KEY=<key-id>:<key-secret> in higgsfield_example/.env.local or the environment.")
    except InsufficientCreditsError:
        return fail("the Higgsfield account has insufficient credits.")
    except Exception as e:  # HTTP errors name the status and URL, never the credentials
        for cls, word in BAD.items():
            if isinstance(last["status"], cls):
                return fail(f"the request {word}; no video was produced.")
        return fail(f"{type(e).__name__}: {str(e)[:200]}")

    # subscribe() fetches the result even when the request ended badly, so check the final status ourselves.
    for cls, word in BAD.items():
        if isinstance(last["status"], cls):
            return fail(f"the request {word}; no video was produced.")
    if not isinstance(last["status"], Completed):
        return fail(f"no final status was observed (last: {type(last['status']).__name__}); not claiming success.")
    url = find_url(result)
    if not url:
        return fail(f"completed, but no video URL was found in the response (top-level keys: {sorted(result) if isinstance(result, dict) else type(result).__name__}).")
    print("video url:", url)
    return 0


if __name__ == "__main__":
    sys.exit(main())
