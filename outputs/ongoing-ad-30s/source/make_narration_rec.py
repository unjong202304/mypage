#!/usr/bin/env python3
"""Narration for AdRec, measured first, laid out second.

Every line is synthesised once (cached by text), its leading silence removed and its tail kept intact: the tail is
only cut where the speech has really decayed, then padded and faded so no syllable ends abruptly. Lines are then
placed back to back with a fixed breath between them; the scene timeline is derived from where each line lands
(public/rec/narration_rec.json), so the picture follows the voice instead of clipping it.
PAID API (ElevenLabs). Voice: ELEVENLABS_VOICE_ID."""
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "public" / "rec"
CACHE = HERE / "public" / "_narration_rec"
VOICE = os.environ.get("ELEVENLABS_VOICE_ID") or sys.exit("set ELEVENLABS_VOICE_ID")
SPEED = 1.05
LEAD = 0.25          # first word starts here
BREATH = 0.28        # gap between lines
TAIL = 1.1           # silence after the last line before the video ends

# gap_before: extra pause before the line (scene change), on top of BREATH
LINES = [
    {"id": "hook", "text": "촬영보다 편집이 더 오래 걸리시죠?", "gap_before": 0.0},
    {"id": "open", "text": "온고잉에서 받은 접수 링크를 열고, 폰에 찍어 둔 영상을 바로 올리거나,", "gap_before": 0.35},
    {"id": "link", "text": "유튜브 롱폼 링크만 붙여 넣으면 접수 준비 끝이에요.", "gap_before": 0.0},
    {"id": "range", "text": "쓰고 싶은 구간은 내가 직접 고르고, 고르기 어렵다면 온고잉에게 맡기세요.", "gap_before": 0.15},
    {"id": "tpl", "text": "실제 템플릿으로 제목, 자막, 댓글 자리까지 미리 보고 정할 수 있어요.", "gap_before": 0.15},
    {"id": "send", "text": "접수하면 사람이 검수하고, 편집실에서 한 번 더 확인한 완성본을 링크로 받아요.", "gap_before": 0.15},
    {"id": "end", "text": "영상은 간단하게 보내고, 편집은 온고잉에게 맡기세요.", "gap_before": 0.3},
]


def ff(*a):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, a)], capture_output=True)
    if r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr.decode(errors="replace")[-600:])


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)


def tts(i):
    body = {"text": LINES[i]["text"], "model_id": "eleven_multilingual_v2", "voice_settings": {"speed": SPEED},
            **({"previous_text": LINES[i - 1]["text"]} if i else {}),
            **({"next_text": LINES[i + 1]["text"]} if i + 1 < len(LINES) else {})}
    key = os.environ.get("ELEVENLABS_API_KEY")
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                 json.dumps(body).encode(),
                                 {"Content-Type": "application/json", **({"xi-api-key": key} if key else {})})
    try:
        return urllib.request.urlopen(req, timeout=180).read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:300]}")


CACHE.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
parts, t, timeline = [], LEAD, []
for i, ln in enumerate(LINES):
    h = hashlib.sha1(f"{VOICE}|{SPEED}|{ln['text']}".encode()).hexdigest()[:12]
    raw, wav = CACHE / f"{h}.mp3", CACHE / f"{h}.wav"
    if not raw.exists():
        raw.write_bytes(tts(i))
    # lead: cut at -45 dB. tail: reverse, cut only below -60 dB (keeps the decay), then 120 ms pad + 80 ms fade
    ff("-i", raw, "-af",
       "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
       "silenceremove=start_periods=1:start_threshold=-60dB,areverse,"
       "apad=pad_dur=0.12,aresample=44100,aformat=channel_layouts=mono", CACHE / f"{h}_p.wav")
    d = dur(CACHE / f"{h}_p.wav")
    ff("-i", CACHE / f"{h}_p.wav", "-af", f"afade=t=out:st={d - 0.08:.3f}:d=0.08", wav)
    if i:
        t += BREATH + ln["gap_before"]
    timeline.append({"id": ln["id"], "text": ln["text"], "start": round(t, 3), "end": round(t + d, 3)})
    print(f"{ln['id']:6s} {t:6.2f} -> {t + d:6.2f}  ({d:.2f}s)  {ln['text']}")
    parts.append(wav)
    t += d

total = t + TAIL
f = ";".join(f"[{i}:a]adelay={int(s['start'] * 1000)}|{int(s['start'] * 1000)}[a{i}]" for i, s in enumerate(timeline))
f += ";" + "".join(f"[a{i}]" for i in range(len(parts))) + \
     f"amix=inputs={len(parts)}:normalize=0:duration=longest,apad,atrim=0:{total:.3f},loudnorm=I=-16:TP=-1.5:LRA=11[a]"
ff(*[x for p in parts for x in ("-i", p)], "-filter_complex", f, "-map", "[a]", "-ar", 44100, "-ac", 1, OUT / "narration_rec.wav")
(OUT / "narration_rec.json").write_text(json.dumps({"total": round(total, 3), "lines": timeline}, ensure_ascii=False, indent=1))
print(f"total {total:.2f}s -> {OUT / 'narration_rec.wav'}")
