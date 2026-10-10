#!/usr/bin/env bash
# 1080x1920, 30 fps, 30 s.  bash render.sh [Ad30|AdFast30] [out file]   (Node 22+, Python 3)
set -e
cd "$(dirname "$0")"
COMP=${1:-Ad30}
if [ "$COMP" = AdFast30 ]; then OUT=${2:-out/ongoing-ad-fast.mp4}; else OUT=${2:-out/ongoing-ad-30s.mp4}; fi
[ -d node_modules ] || npm install --no-audit --no-fund
python3 make_audio.py
python3 make_audio_fast.py
mkdir -p out
CHROME=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)  # cloud sandbox only; elsewhere Remotion downloads its own
PROPS=""; { [ "$COMP" = Ad30 ] && [ -f public/narration.wav ] || [ "$COMP" = AdFast30 ] && [ -f public/narration_fast.wav ]; } && PROPS='--props={"narration":true}'  # make_narration.py (paid API) writes this file
npx remotion render src/index.ts "$COMP" "$OUT" --public-dir=public $PROPS ${CHROME:+--browser-executable=$CHROME}
