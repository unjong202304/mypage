#!/usr/bin/env python3
"""Copies the ad's real assets out of the asset pack into public/assets under short names.
Usage: python3 prepare_assets.py <path to the pack's `assets` folder>
The pack (real product screens, brand files) is NOT committed to git; public/assets is git-ignored."""
import shutil
import sys
from pathlib import Path

PACK = Path(sys.argv[1])
OUT = Path(__file__).parent / "public" / "assets"
MAP = {
    "brand/ongoing-logo-1.png": "logo-white.png",            # white mark+wordmark, for dark backgrounds
    "brand/ongoing-3d-logo.png": "logo-3d.png",              # black 3D wordmark, for light backgrounds
    "screens/archive/title-only9-mobile.png": "shot-title.png",
    "screens/archive/studio-design7-templates.png": "shot-templates.png",
    "screens/archive/delivery-design42-sanitized.png": "shot-delivery.png",
    "screens/mobile/intake-link-auto-native.png": "shot-auto.png",
    "screen-recordings/file-to-link.mp4": "rec-file-link.mp4",
    "screen-recordings/auto-to-manual.mp4": "rec-auto-manual.mp4",
    # cinema is CC BY 3.0 (attribution required) and is deliberately not used
    "ad-footage/travel/licensed-footage-blur-reference.mp4": "clip-travel.mp4",
    "ad-footage/talk/licensed-footage-blur-reference.mp4": "clip-talk.mp4",
    "ad-footage/cooking/licensed-footage-blur-reference.mp4": "clip-cooking.mp4",
    "ad-footage/travel/thumbnail.png": "thumb-travel.png",
    "ad-footage/talk/thumbnail.png": "thumb-talk.png",
    "ad-footage/cooking/thumbnail.png": "thumb-cooking.png",
}
OUT.mkdir(parents=True, exist_ok=True)
for src, dst in MAP.items():
    shutil.copy(PACK / src, OUT / dst)
    print("ok", dst)
