#!/usr/bin/env python3
"""Narration track: one ElevenLabs request per line (narration.json), edge silence trimmed, a line that overruns its
window sped up (max 1.2x), each placed at its start time -> public/narration.wav (mono 44.1 kHz, 30 s).
PAID API: run only when approved. Key: ELEVENLABS_API_KEY (or injected by a sandbox proxy). Voice: ELEVENLABS_VOICE_ID."""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
TMP = HERE / "public" / "_narration"
LINES = json.loads((HERE / os.environ.get("NARR_JSON", "narration.json")).read_text())
OUTWAV = os.environ.get("NARR_OUT", "narration.wav")
VOICE = os.environ.get("ELEVENLABS_VOICE_ID") or sys.exit("set ELEVENLABS_VOICE_ID")
SPEED = float(os.environ.get("VP_SPEED", "1.1"))  # ElevenLabs accepts 0.7-1.2
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"


def ff(*a):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], capture_output=True)
    if r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr.decode(errors="replace")[-600:])


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


def tts(i):
    body = {"text": LINES[i]["text"], "model_id": "eleven_multilingual_v2", "voice_settings": {"speed": SPEED},
            **({"previous_text": LINES[i - 1]["text"]} if i else {}), **({"next_text": LINES[i + 1]["text"]} if i + 1 < len(LINES) else {})}
    key = os.environ.get("ELEVENLABS_API_KEY")
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128", json.dumps(body).encode(),
                                 {"Content-Type": "application/json", **({"xi-api-key": key} if key else {})})
    try:
        return urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:300]}")


TMP.mkdir(parents=True, exist_ok=True)
parts = []
for i, ln in enumerate(LINES):
    raw, wav = TMP / f"{i}.mp3", TMP / f"{i}.wav"
    raw.write_bytes(tts(i))
    ff("-i", raw, "-af", f"{TRIM},aresample=44100,aformat=channel_layouts=mono", wav)
    d = dur(wav)
    if d > ln["max"]:  # does not fit its scene: speed it up rather than let it run into the next one
        fit = min(1.2, d / ln["max"])
        ff("-i", wav, "-af", f"atempo={fit:.3f}", TMP / f"{i}f.wav")
        wav, d = TMP / f"{i}f.wav", d / fit
        print(f"line {i}: sped up x{fit:.2f}")
    print(f"line {i}: {d:.2f}s in a {ln['max']:.1f}s window" + ("  !! still too long" if d > ln["max"] + 0.05 else ""))
    parts.append(wav)

f = ";".join(f"[{i}:a]adelay={int(ln['at'] * 1000)}|{int(ln['at'] * 1000)}[a{i}]" for i, ln in enumerate(LINES))
f += ";" + "".join(f"[a{i}]" for i in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:30[a]"
ff(*[x for p in parts for x in ("-i", p)], "-filter_complex", f, "-map", "[a]", "-ar", 44100, "-ac", 1, HERE / "public" / OUTWAV)
print("wrote", HERE / "public" / OUTWAV)
