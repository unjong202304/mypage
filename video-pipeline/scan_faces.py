#!/usr/bin/env python3
"""Scan EVERY frame of a video for faces that are still detectable (YuNet). Use it on a blurred copy: 0 flagged frames is required, but it is an
automatic check only - also look at the frames yourself (side faces, small faces, faces that leave and re-enter are the usual misses).
usage: python scan_faces.py blurred.mp4 [--score 0.5] [--sheet frames.png]
exit code 0 = no face found in any frame, 1 = faces found, 2 = error.
The detector also fires on blurred blobs at low scores, so a clean 0 is not realistic below ~0.5: judge flagged frames by eye, and use --sheet
(every frame as a small tile, flagged ones outlined red) to review ALL frames, not a few samples."""
import argparse, sys
from pathlib import Path
import cv2
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("--score", type=float, default=0.5); ap.add_argument("--sheet", default="")
a = ap.parse_args()
model = Path(__file__).parent / "models" / "yunet.onnx"
if not model.exists():
    sys.exit("models/yunet.onnx missing - run mosaic_faces.py once (it downloads the model) or place the file there")
cap = cv2.VideoCapture(a.video)
if not cap.isOpened(): sys.exit(2)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
det = cv2.FaceDetectorYN.create(str(model), "", (W, H), a.score, 0.3, 5000)
n, flagged, tiles = 0, [], []
while True:
    ok, fr = cap.read()
    if not ok: break
    _, r = det.detect(fr)
    hit = r is not None and len(r)
    if hit: flagged.append(n)
    if a.sheet:
        t = cv2.resize(fr, (96, int(96 * H / W)))
        if hit: cv2.rectangle(t, (0, 0), (t.shape[1] - 1, t.shape[0] - 1), (0, 0, 255), 3)
        cv2.putText(t, str(n), (3, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
        tiles.append(t)
    n += 1
print(f"{n} frames scanned, {len(flagged)} frame(s) still show a detectable face" + (f": {flagged[:30]}{' ...' if len(flagged) > 30 else ''}" if flagged else ""))
if a.sheet and tiles:
    cols = 20; th, tw = tiles[0].shape[:2]; rows = (len(tiles) + cols - 1) // cols
    sheet = np.zeros((rows * th, cols * tw, 3), np.uint8)
    for i, t in enumerate(tiles): sheet[(i // cols) * th:(i // cols + 1) * th, (i % cols) * tw:(i % cols + 1) * tw] = t
    cv2.imwrite(a.sheet, sheet); print("contact sheet:", a.sheet, f"({len(tiles)} frames)")
sys.exit(1 if flagged else 0)
