#!/usr/bin/env python3
"""Pixelate every detected face in a video (YuNet, OpenCV). Boxes are held a few frames and grown so a missed frame or a head turn
does not flash a face. Audio is copied from the source. Check the output by eye before publishing: no detector is perfect.
usage: python mosaic_faces.py in.mp4 out.mp4 [--start S --dur D] [--block 14] [--grow 1.7] [--hold 8]"""
import argparse, subprocess, sys, urllib.request
from pathlib import Path
import cv2, numpy as np

MODEL = Path(__file__).parent / "models" / "yunet.onnx"
URL = "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx"
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--start", type=float, default=0); ap.add_argument("--dur", type=float, default=0)
ap.add_argument("--block", type=int, default=14, help="mosaic cells across a face"); ap.add_argument("--grow", type=float, default=1.7)
ap.add_argument("--hold", type=int, default=8, help="frames a box is kept after the detector loses it"); ap.add_argument("--score", type=float, default=0.5)
a = ap.parse_args()
if not MODEL.exists():
    MODEL.parent.mkdir(exist_ok=True); urllib.request.urlretrieve(URL, MODEL)

cap = cv2.VideoCapture(a.src)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
cap.set(cv2.CAP_PROP_POS_MSEC, a.start * 1000)
det = cv2.FaceDetectorYN.create(str(MODEL), "", (W, H), a.score, 0.3, 5000)
cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-"]
cmd += ["-ss", str(a.start), *(["-t", str(a.dur)] if a.dur else []), "-i", a.src, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-c:a", "aac", "-shortest", a.out]
enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
held, n, faces_seen = [], 0, 0   # held: [x0,y0,x1,y1,ttl]
limit = int(a.dur * fps) if a.dur else 10**9
while n < limit:
    ok, fr = cap.read()
    if not ok: break
    _, f = det.detect(fr)
    held = [h[:4] + [h[4] - 1] for h in held if h[4] > 1]
    for r in (f if f is not None else []):
        x, y, w, h = r[:4]; cx, cy = x + w / 2, y + h / 2; w2, h2 = w * a.grow, h * a.grow
        held.append([cx - w2 / 2, cy - h2 / 2, cx + w2 / 2, cy + h2 / 2, a.hold]); faces_seen += 1
    for x0, y0, x1, y1, _ in held:
        x0, y0, x1, y1 = max(0, int(x0)), max(0, int(y0)), min(W, int(x1)), min(H, int(y1))
        if x1 - x0 < 4 or y1 - y0 < 4: continue
        roi = fr[y0:y1, x0:x1]
        cells = max(2, a.block)
        small = cv2.resize(roi, (cells, max(2, int(cells * (y1 - y0) / (x1 - x0)))), interpolation=cv2.INTER_AREA)
        fr[y0:y1, x0:x1] = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
    enc.stdin.write(fr.tobytes()); n += 1
enc.stdin.close(); enc.wait()
print(f"{n} frames, {faces_seen} face detections -> {a.out}")
sys.exit(0 if n and faces_seen else 1)
