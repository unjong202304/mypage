"""Offline check of the result handling with a fake SDK. This does NOT call Higgsfield and proves nothing about the live API."""
import io
import sys
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).parent))
import higgsfield_client as hf
import main


def run(final, result=None, raises=None):
    def fake(model, arguments, on_enqueue=None, on_queue_update=None):
        on_enqueue("req-1")
        for s in (hf.Queued(), hf.InProgress(), final):
            on_queue_update(s)
        if raises:
            raise raises
        return result
    out, err = io.StringIO(), io.StringIO()
    with mock.patch.object(hf, "subscribe", fake), redirect_stdout(out), redirect_stderr(err):
        code = main.main()
    return code, out.getvalue(), err.getvalue()


code, out, _ = run(hf.Completed(), {"video": {"url": "https://example.test/v.mp4"}})
assert code == 0 and "video url: https://example.test/v.mp4" in out
for final, word in ((hf.Failed(), "failed"), (hf.NSFW(), "moderation"), (hf.Cancelled(), "canceled")):
    code, out, err = run(final, {"video": {"url": "https://example.test/stale.mp4"}})  # SDK still returns a body: must not count as success
    assert code == 1 and word in err and "video url" not in out, (final, err)
code, out, err = run(hf.Completed(), {"status": "ok"})
assert code == 1 and "no video URL" in err
code, out, err = run(hf.Failed(), raises=RuntimeError("boom"))
assert code == 1 and "failed" in err
print("ok (offline simulation only)")
