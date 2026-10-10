"""Line A (AI footage). Not built yet. Contract: produce a local portrait mp4 WITH audio, then call
`vp.py run JOB <that file>` (or `vp.py intake JOB <file> ai`).

Providers to plug in (keep each behind this one function so they stay swappable):
  - Higgsfield API: avatar/video generation (paid credits; check the free tier first)
  - ElevenLabs API: voice (free tier exists); pair with any talking-head generator
"""
from pathlib import Path


def produce(script_text: str, out_path: Path) -> Path:
    raise NotImplementedError("Line A: plug a provider in here")
