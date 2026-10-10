# video-pipeline

Footage in -> cut, caption, motion-graphic split layout -> `final.mp4`. Every stage is a CLI that reads/writes
`<job>/manifest.json`, so any agent harness (Claude, Codex, DeepSeek) can drive it.

```
./setup.sh                                  # ffmpeg, Korean font, venv, remotion deps
.venv/bin/python vp.py run jobs/x clip.mp4  # intake -> transcribe -> cuts -> captions -> render
.venv/bin/python test_vp.py                 # logic self-check
```

## Concept: AI-tools roundup short (the format we copy; the topic is swappable)
hook -> N numbered items (one scene card each) -> result -> comment-CTA. `script.json` carries that shape, so a new
topic = a new `script.json` + `research.json`, no code change.

```
vp.py research JOB owner/repo ..   # facts for cards (needs api.github.com; else fill research.json by hand)
(LLM writes JOB/script.json)       # {lang, hook, items[{repo,anchor,say,label}], result, cta, vocab[], emphasis[]}
vp.py script JOB                   # validates it; writes script.txt (send to shooter / TTS) + vocab/emphasis hints
(footage arrives: Line A or B)
vp.py run JOB footage.mp4          # ... -> scenes (cards timed to the spoken item) -> render
./smoke.sh                         # whole chain with an espeak voice (English); mechanics only
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

## Known limits
- Cloud sandbox blocks api.github.com for repos outside the session, so card stars are blank there (never invented). Works locally.
- Korean alignment is unverified: espeak Korean is not intelligible to Whisper, so only the English smoke test has run.
  Test Korean with real speech. Whisper may mis-hear names; list them in `vocab`.
- Scene timing uses the spoken `anchor` word; if any anchor is not heard it falls back to sentence-length proportions.

## Not built yet
Best-take scoring (MediaPipe vs script), Silero VAD, SFX/BGM, GitHub-card scenes (GitHub API), screenshots (Playwright).
Cuts use word gaps (>0.35s) instead of VAD. Landscape / rotated phone clips are not normalised.
