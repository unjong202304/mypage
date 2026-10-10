#!/usr/bin/env python3
"""Sound bed for AdReal: a swoosh on every cut, pops on the word slams, review dings, a closing chime, and a quiet pad.
Synthesised here (no samples, no third-party music). Cut times mirror PLAN in src/AdFast.tsx. Writes public/audio_real.wav."""
import math
import random
import struct
import wave
from pathlib import Path

SR, DUR = 44100, 38.5
N = int(SR * DUR)
buf = [0.0] * N
CUTS = [0, 3.8, 10.2, 16.9, 22.9, 28, 34]
random.seed(7)


def add(t0, fn, length):
    i0 = int(t0 * SR)
    for i in range(min(int(length * SR), N - i0)):
        buf[i0 + i] += fn(i / SR)


def swoosh(t0, length=0.3, gain=0.17):
    y = 0.0
    def fn(x):
        nonlocal y
        a = 0.03 + 0.55 * (x / length)            # filter opens as the sweep passes
        y += a * (random.uniform(-1, 1) - y)
        return gain * math.sin(math.pi * x / length) ** 2 * y * 2.2
    add(t0, fn, length)


def pop(t0, f=620, gain=0.2):
    add(t0, lambda x: gain * math.sin(2 * math.pi * f * x) * math.exp(-38 * x) + 0.10 * math.sin(2 * math.pi * 130 * x) * math.exp(-22 * x), 0.22)


def ding(t0, gain=0.13):
    add(t0, lambda x: gain * math.sin(2 * math.pi * 1318.5 * x) * math.exp(-6 * x) + 0.07 * math.sin(2 * math.pi * 1760 * x) * math.exp(-8 * x), 1.1)


for k, t in enumerate(CUTS):
    swoosh(max(0, t - 0.06))
    pop(t + 0.1, 560 + 40 * (k % 4))
    pop(t + 0.42, 760, 0.12)
for t in (24.2, 24.7, 25.1, 25.6):  # check marks
    ding(t)
ding(35.4, 0.16)                       # logo lands

for i in range(N):  # pad
    t = i / SR
    env = min(1.0, t / 1.5, (DUR - t) / 2.5)
    buf[i] += 0.03 * env * (0.85 + 0.15 * math.sin(2 * math.pi * 0.25 * t)) * sum(a * math.sin(2 * math.pi * f * t) for f, a in ((110, 1.0), (164.81, 0.7), (220, 0.6), (261.63, 0.4)))

scale = 0.7 / (max(abs(v) for v in buf) or 1.0)
out = Path(__file__).parent / "public" / "audio_real.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v * scale)) * 32767)) for v in buf))
print("wrote", out)
