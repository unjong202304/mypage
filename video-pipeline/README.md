# video-pipeline

Footage in -> cut, caption, motion-graphic split layout -> `final.mp4`. Every stage is a CLI that reads/writes
`<job>/manifest.json`, so any agent harness (Claude, Codex, DeepSeek) can drive it.

```
./setup.sh                                  # ffmpeg, Korean font, venv, remotion deps
.venv/bin/python vp.py run jobs/x clip.mp4  # intake -> transcribe -> cuts -> captions -> render
.venv/bin/python test_vp.py                 # logic self-check
```

## Concept: AI-tools roundup short (the format we copy; the topic is swappable)
hook -> N numbered items -> result -> comment-CTA. `script.json` is a storyboard, so a new topic = a new
`script.json` + `research.json`, no code change:

```
{"lang":"ko", "steps":["skills",..], "vocab":[..], "emphasis":[..],
 "beats":[{"say":"one spoken sentence",
           "visuals":[{"layout":"top|bottom|full", "kind":"...", ...props, "step":0}]}]}   # no visuals = face only
```
Each beat is matched to the transcript (tolerates mis-heard words); its visuals share the sentence's time equally, hard cuts.
Kinds: `title{text,hl[],sub}` `stat{value,label}` `list{title,items[]}` `repo{repo,sub,cmd,stats[]}` `terminal{title,chip,cmd,lines[]}`
`compare{left{label,title},right{..}}` `diagram{nodes[{label,sub}],status}` `doc{title,file,steps}` `logos{chips[],label}` `media{src}` (file in the job dir).
`layout`: `top` graphic over face, `bottom` face over graphic, `full` graphic only (audio continues).

```
vp.py research JOB owner/repo ..   # facts for cards (needs api.github.com; else fill research.json by hand)
(LLM writes JOB/script.json)       # storyboard, see below
vp.py script JOB                   # validates it; writes script.txt (send to shooter / TTS) + vocab/emphasis hints
(footage arrives: Line A or B)
vp.py run JOB footage.mp4          # ... -> scenes (visuals timed to the spoken sentence) -> render
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
- Beat timing is a best-match segmentation of the transcript; very short or repeated sentences can land a word early/late.

## Not built yet
Best-take scoring (MediaPipe vs script), Silero VAD, SFX/BGM, GitHub-card scenes (GitHub API), screenshots (Playwright).
Cuts use word gaps (>0.35s) instead of VAD. Landscape / rotated phone clips are not normalised.
