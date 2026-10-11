#!/usr/bin/env python3
"""Cut the user's phone screen recording into the clips AdRec plays, with third-party material hidden.

The recording runs the real intake flow on a YouTube music video, so every frame region that shows that video
(embed, range-slider thumbnails, template video zone), its title/channel, the pasted URL and the typed title are
blurred hard. The UI itself stays sharp. Status bar and the bottom browser bar are cropped off (y 150..1880).
Usage: python3 prep_rec.py <recording.mp4>  ->  public/rec/<clip>.mp4"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

SRC = sys.argv[1]
OUT = Path(__file__).parent / "public" / "rec"
Y0, Y1 = 150, 1880

TITLE_LOADED = (50, 395, 840, 485)      # 채널 · ... / 곡 제목 strip above the embed
EMBED = (36, 495, 844, 955)             # YouTube embed
STRIP_LINK = (60, 1150, 820, 1245)      # range slider thumbnails, layout right after loading
STRIP_RANGE = (60, 1180, 820, 1275)     # range slider thumbnails, layout from ~20 s
TPL_VIDEO = (120, 548, 580, 905)        # video zone inside the template preview
TPL_TITLE = (230, 420, 470, 520)        # typed title inside the template preview


def link_boxes(t, f):
    if f[1450:1800].mean() < 70:                           # keyboard up: URL being pasted
        return [(40, 420, 610, 560)] if t > 12.6 else []
    if t < 15.0:
        return []
    loading = f[1200:1500, 100:800].mean() < 40            # black placeholder while the embed loads
    if loading or t < 17.3:                                # pasted URL sits in the field until the embed loads
        return [(40, 600, 600, 720), (50, 1040, 830, 1135)]  # URL field, title strip
    return [TITLE_LOADED, EMBED, STRIP_LINK]


CLIPS = {
    # name: (start, end, boxes(t, frame))
    "file": (8.0, 11.7, lambda t, f: []),
    "link": (11.4, 19.8, link_boxes),
    "choose": (9.0, 9.1, lambda t, f: []),
    "range": (20.3, 39.8, lambda t, f: [TITLE_LOADED, EMBED, STRIP_RANGE]),
    "tpl_a": (55.8, 58.7, lambda t, f: [TPL_VIDEO]),
    "tpl_b": (77.3, 86.8, lambda t, f: [TPL_VIDEO, TPL_TITLE]),
    "confirm": (100.7, 103.3, lambda t, f: [(30, 330, 850, 390), (300, 580, 580, 628), (370, 745, 590, 820),
                                             (235, 860, 650, 1055)]),
    "done": (106.3, 108.8, lambda t, f: []),
}


def hide(f, box):
    x0, y0, x1, y1 = box
    roi = f[y0:y1, x0:x1]
    h, w = roi.shape[:2]
    small = cv2.resize(roi, (max(1, w // 28), max(1, h // 28)), interpolation=cv2.INTER_AREA)
    big = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
    f[y0:y1, x0:x1] = cv2.GaussianBlur(big, (0, 0), 9)


OUT.mkdir(parents=True, exist_ok=True)
for name, (a, b, boxes) in CLIPS.items():
    cap = cv2.VideoCapture(SRC)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_MSEC, a * 1000)
    W, H = int(cap.get(3)), Y1 - Y0
    if name == "choose":   # one still frame of the two choice cards
        ok, f = cap.read()
        cv2.imwrite(str(OUT / "choose.png"), f[Y0:Y1])
        continue
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                            "-r", str(fps), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                            "-pix_fmt", "yuv420p", "-an", str(OUT / f"{name}.mp4")], stdin=subprocess.PIPE)
    n = 0
    while True:
        t = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        ok, f = cap.read()
        if not ok or t > b:
            break
        for bx in boxes(t, f):
            hide(f, bx)
        enc.stdin.write(np.ascontiguousarray(f[Y0:Y1]).tobytes())
        n += 1
    enc.stdin.close()
    enc.wait()
    print(f"{name}: {n} frames ({n / fps:.2f}s)")
