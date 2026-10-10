#!/usr/bin/env python3
"""Obscure every detected face in a video (YuNet, OpenCV). Two passes: first all frames are scanned, then each frame is obscured with the boxes found
in the neighbouring frames too (+-hold), so a missed frame, a head turn or the first/last frame cannot show a face. Boxes are grown. Audio is copied.
No detector is perfect: review the output (see scan_faces.py --sheet) before publishing.
usage: python mosaic_faces.py in.mp4 out.mp4 [--start S --dur D] [--mode blur|pixel] [--grow 1.7] [--hold 8] [--score 0.5] [--mask x,y,w,h ...]
--mode blur  = coarse pixelation, smoothed and blurred (default; features are unrecognisable)   --mode pixel = plain mosaic blocks
--mask blurs a fixed region (fractions of the frame, e.g. 0.8,0.0,0.2,0.12 for a corner logo); repeatable."""
import argparse, subprocess, sys, urllib.request
from pathlib import Path
import cv2, numpy as np

MODEL = Path(__file__).parent / "models" / "yunet.onnx"
URL = "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx"
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--start", type=float, default=0); ap.add_argument("--dur", type=float, default=0)
ap.add_argument("--mode", choices=["blur", "pixel"], default="blur"); ap.add_argument("--block", type=int, default=10, help="cells across a face")
ap.add_argument("--grow", type=float, default=1.7); ap.add_argument("--hold", type=int, default=8, help="neighbour frames (each side) whose boxes are also applied")
ap.add_argument("--score", type=float, default=0.5); ap.add_argument("--mask", action="append", default=[])
a = ap.parse_args()
if not MODEL.exists():
    MODEL.parent.mkdir(exist_ok=True); urllib.request.urlretrieve(URL, MODEL)
masks = [tuple(float(v) for v in m.split(",")) for m in a.mask]


def open_cap():
    c = cv2.VideoCapture(a.src); c.set(cv2.CAP_PROP_POS_MSEC, a.start * 1000); return c


cap = open_cap()
fps = cap.get(cv2.CAP_PROP_FPS) or 30
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
limit = int(a.dur * fps) if a.dur else 10**9
det = cv2.FaceDetectorYN.create(str(MODEL), "", (W, H), a.score, 0.3, 5000)

boxes = []   # pass 1: grown boxes per frame
while len(boxes) < limit:
    ok, fr = cap.read()
    if not ok: break
    _, f = det.detect(fr)
    row = []
    for r in (f if f is not None else []):
        x, y, w, h = r[:4]; cx, cy = x + w / 2, y + h / 2; w2, h2 = w * a.grow, h * a.grow
        row.append((cx - w2 / 2, cy - h2 / 2, cx + w2 / 2, cy + h2 / 2))
    boxes.append(row)
cap.release()
n = len(boxes)
if not n: sys.exit("no frames read")


def obscure(roi):
    h, w = roi.shape[:2]
    if a.mode == "pixel":
        s = cv2.resize(roi, (max(2, a.block), max(2, int(a.block * h / w))), interpolation=cv2.INTER_AREA)
        return cv2.resize(s, (w, h), interpolation=cv2.INTER_NEAREST)
    s = cv2.resize(roi, (max(2, a.block), max(2, int(a.block * h / w))), interpolation=cv2.INTER_AREA)   # coarse: features cannot survive
    up = cv2.resize(s, (w, h), interpolation=cv2.INTER_CUBIC)
    k = max(3, (max(h, w) // 4) | 1)
    return cv2.GaussianBlur(up, (k, k), 0)


cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-"]
cmd += ["-ss", str(a.start), *(["-t", str(a.dur)] if a.dur else []), "-i", a.src, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "aac", "-shortest", a.out]
enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
cap = open_cap(); applied = 0
for i in range(n):
    ok, fr = cap.read()
    if not ok: break
    todo = [b for j in range(max(0, i - a.hold), min(n, i + a.hold + 1)) for b in boxes[j]]
    for x0, y0, x1, y1 in todo:
        x0, y0, x1, y1 = max(0, int(x0)), max(0, int(y0)), min(W, int(x1)), min(H, int(y1))
        if x1 - x0 < 4 or y1 - y0 < 4: continue
        fr[y0:y1, x0:x1] = obscure(fr[y0:y1, x0:x1])
    for mx, my, mw, mh in masks:
        x0, y0 = int(mx * W), int(my * H); x1, y1 = min(W, x0 + int(mw * W)), min(H, y0 + int(mh * H))
        fr[y0:y1, x0:x1] = obscure(fr[y0:y1, x0:x1])
    applied += bool(todo)
    enc.stdin.write(fr.tobytes())
enc.stdin.close(); enc.wait()
print(f"{n} frames; {sum(1 for r in boxes if r)} with a direct detection, {applied} obscured -> {a.out}")
sys.exit(0 if applied else 1)
