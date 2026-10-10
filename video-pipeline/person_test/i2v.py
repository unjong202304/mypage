"""Photo -> short talking-head clip via Higgsfield (BILLABLE). Run locally: python i2v.py photo.jpg [voice.mp3]
Needs HF_KEY in ../higgsfield_example/.env.local (or env). Never prints the key. Overrides: HF_MODEL, HF_IMG_KEY, HF_AUDIO_KEY."""
import os, sys
from pathlib import Path
from dotenv import load_dotenv
import higgsfield_client as hf

load_dotenv(Path(__file__).parent.parent / "higgsfield_example" / ".env.local")
MODEL = os.environ.get("HF_MODEL", "bytedance/seedance-2.5/image-to-video")
IMG_KEY = os.environ.get("HF_IMG_KEY", "image_url")
AUDIO_KEY = os.environ.get("HF_AUDIO_KEY", "audio_url")
PROMPT = ("Vertical 9:16 selfie-style video of the person in the photo speaking to the camera in Korean, "
          "friendly confident expression, natural head movement and lip movement, same office background, "
          "stable framing, no text overlays.")


def main():
    photo = sys.argv[1] if len(sys.argv) > 1 else sys.exit("usage: python i2v.py photo.jpg [voice.mp3]")
    args = {"prompt": PROMPT, "duration": 5, "resolution": "720p", "aspect_ratio": "9:16", IMG_KEY: hf.upload_file(photo)}
    if len(sys.argv) > 2:
        args[AUDIO_KEY] = hf.upload_file(sys.argv[2])
    last = {"s": None}

    def on_update(s):
        n = type(s).__name__
        if n != last["s"]:
            last["s"] = n
            print("status:", n, flush=True)

    try:
        res = hf.subscribe(MODEL, arguments=args, on_queue_update=on_update)
    except hf.CredentialsMissedError:
        sys.exit("HF_KEY missing (key-id:key-secret) in .env.local")
    except hf.InsufficientCreditsError:
        sys.exit("FAILED: not enough Higgsfield credits")
    except Exception as e:
        sys.exit(f"FAILED: {type(e).__name__}: {str(e)[:400]}")
    if last["s"] in ("Failed", "NSFW", "Cancelled"):
        sys.exit(f"FAILED: {last['s']}")

    def find(o):
        if isinstance(o, dict):
            if isinstance(o.get("url"), str):
                return o["url"]
            for v in o.values():
                if (u := find(v)): return u
        if isinstance(o, list):
            for v in o:
                if (u := find(v)): return u

    print("video url:", find(res) or res)


main()
