"""Line A (AI voice): ElevenLabs text-to-speech -> mp3 -> footage.mp4 (black 720x1280 + the voice).
Same contract as Line B: a portrait mp4 with audio, ready for `vp.py run`.
Video/avatar generation (Higgsfield etc.) is not built; only the voice."""
import json
import os
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


def produce(texts, out_mp4, voice=None, model="eleven_multilingual_v2", speed=None, gap=0.12):
    """One request per sentence (so speed/pauses are ours, not the model's), each trimmed of its edge silence and
    joined with a `gap`-second pause; then black 720x1280 video under the voice."""
    voice = voice or keys.get("ELEVENLABS_VOICE_ID") or sys.exit("set ELEVENLABS_VOICE_ID (list them with `vp.py voices`)")
    speed = speed or float(os.environ.get("VP_SPEED", "1.15"))  # ElevenLabs accepts 0.7-1.2
    out_mp4 = Path(out_mp4)
    parts = []
    for i, t in enumerate(texts):
        body = {"text": t, "model_id": model, "voice_settings": {"speed": speed},
                **({"previous_text": texts[i - 1]} if i else {}), **({"next_text": texts[i + 1]} if i + 1 < len(texts) else {})}
        p = out_mp4.with_name(f"{out_mp4.stem}_{i}.mp3")
        p.write_bytes(_call(f"/text-to-speech/{voice}?output_format=mp3_44100_128", body))
        parts.append(p)
    trim = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"
    f = ";".join(f"[{i}:a]{trim},aresample=44100,aformat=channel_layouts=mono,apad=pad_dur={gap}[a{i}]" for i in range(len(parts)))
    f += ";" + "".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[a]"
    mp3 = out_mp4.with_suffix(".mp3")
    _ff([x for p in parts for x in ("-i", str(p))], "-filter_complex", f, "-map", "[a]", "-c:a", "libmp3lame", str(mp3))
    _ff(["-f", "lavfi", "-i", "color=c=black:s=720x1280:r=30", "-i", str(mp3)], "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(out_mp4))
    return out_mp4


def _ff(inputs, *args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, *args], capture_output=True)
    if r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr.decode(errors="replace")[-500:])
