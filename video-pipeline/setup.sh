#!/usr/bin/env bash
# Idempotent. Also usable as the cloud environment "setup script".
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { apt-get update -q; apt-get install -y -q ffmpeg; }
fc-list :lang=ko | grep -q "Noto Sans CJK" || { apt-get update -q; apt-get install -y -q fonts-noto-cjk; }
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q faster-whisper numpy
(cd remotion && npm install --no-audit --no-fund --silent)
