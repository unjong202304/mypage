#!/usr/bin/env bash
# 1080x1920, 30 fps, 30 s -> out/ongoing-ad-30s.mp4  (needs Node 22+, ffmpeg-free: Remotion bundles its own, Python 3)
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --no-audit --no-fund
python3 make_audio.py
mkdir -p out
CHROME=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)  # cloud sandbox only; elsewhere Remotion downloads its own
PROPS=""; [ -f public/narration.wav ] && PROPS='--props={"narration":true}'  # make_narration.py (paid API) writes this file
npx remotion render src/index.ts Ad30 out/ongoing-ad-30s.mp4 --public-dir=public $PROPS ${CHROME:+--browser-executable=$CHROME}
