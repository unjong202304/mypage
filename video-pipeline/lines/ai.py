"""Line A (AI voice): ElevenLabs text-to-speech -> mp3 -> footage.mp4 (black 720x1280 + the voice).
Same contract as Line B: a portrait mp4 with audio, ready for `vp.py run`.
Video/avatar generation (Higgsfield etc.) is not built; only the voice."""
import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import keys

API = "https://api.elevenlabs.io/v1"


def _call(path, body=None):
    key = keys.get("ELEVENLABS_API_KEY")  # may be empty when the sandbox proxy injects it
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None,
                                 headers={"Content-Type": "application/json", **({"xi-api-key": key} if key else {})})
    try:
        return urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:300]}")
    except urllib.error.URLError as e:
        sys.exit(f"cannot reach api.elevenlabs.io ({e.reason}); allow that domain in the network settings")


def voices():
    for v in json.loads(_call("/voices"))["voices"]:
        print(v["voice_id"], "|", v["name"], "|", (v.get("labels") or {}).get("language", ""))


def produce(text, out_mp4, voice=None, model="eleven_multilingual_v2"):
    voice = voice or keys.get("ELEVENLABS_VOICE_ID") or sys.exit("set ELEVENLABS_VOICE_ID (list them with `vp.py voices`)")
    out_mp4 = Path(out_mp4)
    mp3 = out_mp4.with_suffix(".mp3")
    mp3.write_bytes(_call(f"/text-to-speech/{voice}?output_format=mp3_44100_128", {"text": text, "model_id": model}))
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=black:s=720x1280:r=30", "-i", str(mp3), "-shortest",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(out_mp4)], capture_output=True)
    if r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr.decode(errors="replace")[-500:])
    return out_mp4
