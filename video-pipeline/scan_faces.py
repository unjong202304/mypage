#!/usr/bin/env python3
"""Scan EVERY frame of a video for faces that are still detectable (YuNet). Use it on a blurred copy: 0 flagged frames is required, but it is an
automatic check only - also look at the frames yourself (side faces, small faces, faces that leave and re-enter are the usual misses).
usage: python scan_faces.py blurred.mp4 [--score 0.3]      exit code 0 = no face found in any frame, 1 = faces found, 2 = error"""
import argparse, sys
from pathlib import Path
import cv2

ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--score", type=float, default=0.3)
a = ap.parse_args()
model = Path(__file__).parent / "models" / "yunet.onnx"
if not model.exists():
    sys.exit("models/yunet.onnx missing - run mosaic_faces.py once (it downloads the model) or place the file there")
cap = cv2.VideoCapture(a.video)
if not cap.isOpened(): sys.exit(2)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
det = cv2.FaceDetectorYN.create(str(model), "", (W, H), a.score, 0.3, 5000)
n, flagged = 0, []
while True:
    ok, fr = cap.read()
    if not ok: break
    _, r = det.detect(fr)
    if r is not None and len(r): flagged.append(n)
    n += 1
print(f"{n} frames scanned, {len(flagged)} frame(s) still show a detectable face" + (f": {flagged[:30]}{' ...' if len(flagged) > 30 else ''}" if flagged else ""))
sys.exit(1 if flagged else 0)
