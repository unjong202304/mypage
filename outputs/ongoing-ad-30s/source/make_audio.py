#!/usr/bin/env python3
"""Synthesises the ad's sound bed: soft touch taps, a few dings and a quiet pad. Original, generated here, no samples
and no third-party music, so there is nothing to license. Writes public/audio.wav (mono 44.1 kHz)."""
import math
import struct
import wave
from pathlib import Path

SR, DUR = 44100, 30.0
N = int(SR * DUR)
buf = [0.0] * N

# cue times in seconds, written against the scene windows in src/theme.ts
TAPS = [0.5, 1.3, 1.9, 4.0, 4.15, 8.0, 8.85, 11.5, 12.6, 13.6, 14.7, 15.8, 26.0]
DINGS = [19.4, 20.3, 21.3, 22.2, 17.3, 27.6]  # review checks, merge, final chime


def add(t0, fn, length):
    i0 = int(t0 * SR)
    for i in range(min(int(length * SR), N - i0)):
        buf[i0 + i] += fn(i / SR)


for t in TAPS:  # soft tick over a short low thump
    add(t, lambda x: 0.22 * math.sin(2 * math.pi * 900 * x) * math.exp(-48 * x) + 0.20 * math.sin(2 * math.pi * 150 * x) * math.exp(-26 * x), 0.3)
for t in DINGS:
    add(t, lambda x: 0.13 * math.sin(2 * math.pi * 1318.5 * x) * math.exp(-6 * x) + 0.07 * math.sin(2 * math.pi * 1760 * x) * math.exp(-8 * x), 1.2)

for i in range(N):  # pad: A minor-ish chord, slow tremolo, faded in and out
    t = i / SR
    env = min(1.0, t / 2.5, (DUR - t) / 3.0)
    trem = 0.8 + 0.2 * math.sin(2 * math.pi * 0.18 * t)
    buf[i] += 0.035 * env * trem * sum(a * math.sin(2 * math.pi * f * t) for f, a in ((110, 1.0), (164.81, 0.7), (220, 0.6), (261.63, 0.4)))

peak = max(abs(v) for v in buf) or 1.0
scale = 0.7 / peak
out = Path(__file__).parent / "public" / "audio.wav"
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * scale)) * 32767)) for v in buf))
print("wrote", out)
