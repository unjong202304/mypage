# video-pipeline

Footage in -> cut, caption, motion-graphic split layout -> `final.mp4`. Every stage is a CLI that reads/writes
`<job>/manifest.json`, so any agent harness (Claude, Codex, DeepSeek) can drive it.

```
./setup.sh                                  # ffmpeg, Korean font, venv, remotion deps
.venv/bin/python vp.py run jobs/x clip.mp4  # intake -> transcribe -> cuts -> captions -> render
.venv/bin/python test_vp.py                 # logic self-check
```

## Two input lines (same contract: a local portrait mp4 with audio)
- **Line B (human shoot)**: the host app (editing helper) already handles the OneDrive link, download and upload.
  It passes the downloaded path to `vp.py intake`, and uploads `<job>/final.mp4` (`manifest.output`) when done.
- **Line A (AI)**: `lines/ai.py` is a stub. Higgsfield / ElevenLabs go there later.

## Contract
`manifest.json`: `line, raw, duration, lang, words[{w,s,e}], keep[[s,e]], edited, duration_edit, words_edit, captions[{s,e,text,hl[]}], output`

`decisions.json` (optional, written by the LLM; times are in the edited timeline):
`{"vocab": [..], "emphasis": [..], "scenes": [{"s":6,"e":9.5,"title":"..","sub":".."}]}`
- `vocab`: proper nouns fed to Whisper as a hint. `emphasis`: substrings coloured in captions.
- `scenes`: top panel cards; outside a scene the face goes full frame.

## Not built yet
Best-take scoring (MediaPipe vs script), Silero VAD, SFX/BGM, GitHub-card scenes (GitHub API), screenshots (Playwright).
Cuts use word gaps (>0.35s) instead of VAD. Landscape / rotated phone clips are not normalised.
