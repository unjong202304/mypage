#!/usr/bin/env bash
# End-to-end check with no real footage: espeak voice over a flat clip. Proves the mechanics, not the looks.
set -e
cd "$(dirname "$0")"
J=jobs/smoke; rm -rf $J; mkdir -p $J
cp examples/smoke/*.json $J/
.venv/bin/python vp.py script $J
espeak-ng -v en-us -s 150 -f $J/script.txt -w $J/voice.wav
ffmpeg -v error -y -f lavfi -i color=c=0x2a3a4a:s=406x720:r=24 -i $J/voice.wav -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac $J/footage.mp4
.venv/bin/python vp.py run $J $J/footage.mp4
