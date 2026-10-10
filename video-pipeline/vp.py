#!/usr/bin/env python3
"""Reel pipeline. Each stage reads/writes <job>/manifest.json (contract: README.md).
Usage: vp.py keys [status] | voices | brief JOB "topic" [repo..] | write JOB | voice JOB | make JOB | draft JOB (silent) | research JOB owner/repo.. | script JOB | intake JOB VIDEO | transcribe JOB | cuts JOB | captions JOB | scenes JOB | render JOB | run JOB VIDEO"""
import glob, json, os, re, shutil, subprocess, sys, urllib.request
from difflib import SequenceMatcher
from pathlib import Path

import keys

HERE = Path(__file__).parent


def run(*a, cwd=None):
    r = subprocess.run([str(x) for x in a], capture_output=True, cwd=cwd)
    if r.returncode:
        sys.exit(f"{a[0]} failed:\n{r.stderr.decode(errors='replace')[-2000:]}")
    return r.stdout


def load(job):
    return json.loads((Path(job) / "manifest.json").read_text())


def save(job, m):
    (Path(job) / "manifest.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))


def decisions(job):
    """Optional LLM-written file: {vocab:[], emphasis:[], scenes:[{s,e,title,sub}]} (edited-timeline seconds)."""
    p = Path(job) / "decisions.json"
    return json.loads(p.read_text()) if p.exists() else {}


# ---- pure logic (unit-tested in test_vp.py) ----
def plan_keep(words, duration, gap=0.35, pad=0.08):
    keep = []
    for w in words:
        if keep and w["s"] - keep[-1][1] <= gap:
            keep[-1][1] = w["e"]
        else:
            keep.append([w["s"], w["e"]])
    return [[max(0, s - pad), min(duration, e + pad)] for s, e in keep]


def remap(words, keep):
    starts, off = [], 0.0
    for s, e in keep:
        starts.append(off)
        off += e - s
    out = []
    for w in words:
        for (s, e), o in zip(keep, starts):
            if s <= w["s"] <= e:
                out.append({**w, "s": round(w["s"] - s + o, 2), "e": round(min(w["e"], e) - s + o, 2)})
                break
    return out, off


def chunk(words, emph, max_words=3, max_chars=10, breaks=()):  # 10 hangul fit one caption line at 64px
    chunks, cur = [], []

    def flush():
        if cur:
            chunks.append({"s": cur[0]["s"], "e": cur[-1]["e"], "text": " ".join(x["w"] for x in cur),
                           "hl": [i for i, x in enumerate(cur) if any(k in x["w"] for k in emph)]})
            cur.clear()

    for n, w in enumerate(words):
        if cur and (n in breaks or len(cur) >= max_words or len(" ".join(x["w"] for x in cur + [w])) > max_chars):
            flush()
        cur.append(w)
    flush()
    for a, b in zip(chunks, chunks[1:]):  # hold caption through short gaps, no flicker
        a["e"] = round(min(b["s"], a["e"] + 0.3), 2)
    return chunks


def segment(words, sents):
    """Split the transcript into len(sents) consecutive runs that best match each script sentence (survives mis-heard words).
    Returns [(first_word_idx, end_idx)]."""
    norm = lambda t: re.sub(r"[\W_]+", "", t.lower())
    n, w = len(sents), len(words)
    tn = [norm(x) for x in sents]
    total = sum(map(len, tn)) or 1
    if w < n:  # shortcut: too few words to align, split evenly
        return [(k * w // n, (k + 1) * w // n) for k in range(n)]
    span = [max(3, int(w * len(t) / total * 2.5) + 2) for t in tn]
    neg = float("-inf")
    best = [[neg] * (w + 1) for _ in range(n + 1)]
    back = [[0] * (w + 1) for _ in range(n + 1)]
    best[0][0] = 0.0
    for k in range(n):
        for i in range(k, w):
            if best[k][i] == neg:
                continue
            for j in range(i + 1, min(w, i + span[k]) + 1):
                sc = best[k][i] + SequenceMatcher(None, tn[k], norm("".join(x["w"] for x in words[i:j]))).ratio() * len(tn[k])
                if sc > best[k + 1][j]:
                    best[k + 1][j], back[k + 1][j] = sc, i
    if best[n][w] == neg:  # span limits made it infeasible
        return [(k * w // n, (k + 1) * w // n) for k in range(n)]
    out, j = [], w
    for k in range(n, 0, -1):
        i = back[k][j]
        out.append((i, j))
        j = i
    return out[::-1]


# ---- stages ----
def research(job, *repos):
    """Per-repo facts for scene cards. Needs api.github.com (set GITHUB_TOKEN to lift rate limits); never invents numbers."""
    job = Path(job)
    job.mkdir(parents=True, exist_ok=True)
    p = job / "research.json"
    have = {r["repo"]: r for r in json.loads(p.read_text())} if p.exists() else {}
    for r in repos:
        item = have.setdefault(r, {"repo": r})
        try:
            h = {"User-Agent": "vp"} | ({"Authorization": "Bearer " + keys.get("GITHUB_TOKEN")} if keys.get("GITHUB_TOKEN") else {})
            d = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.github.com/repos/{r}", headers=h), timeout=15))
            item |= {"desc": d["description"], "stars": d["stargazers_count"], "url": d["html_url"]}
        except Exception as e:
            print(f"warn: {r}: no GitHub metadata ({e}); fill {p} by hand", file=sys.stderr)
    p.write_text(json.dumps(list(have.values()), ensure_ascii=False, indent=1))


def script(job):
    """Validate the LLM-written script.json (a storyboard of beats), emit script.txt (to the shooter / TTS) and name hints."""
    job = Path(job)
    sc = json.loads((job / "script.json").read_text())
    beats = sc["beats"]
    assert beats and all(b.get("say") for b in beats), "every beat needs `say`"
    (job / "script.txt").write_text("\n".join(b["say"] for b in beats) + "\n")
    d = decisions(job)
    repos = [v["repo"].split("/")[-1] for b in beats for v in b.get("visuals", []) if "repo" in v]
    d["vocab"] = repos + sc.get("vocab", [])
    d["emphasis"] = sc.get("emphasis", [])
    (job / "decisions.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))


def intake(job, src, line="human"):  # lang comes from script.json when present
    """Line B: src is a local file the host app already downloaded. Line A (lines/ai.py) must hand over the same kind of file."""
    job = Path(job)
    job.mkdir(parents=True, exist_ok=True)
    info = json.loads(run("ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", src))
    kinds = {s["codec_type"] for s in info["streams"]}
    assert {"video", "audio"} <= kinds, f"need video+audio, got {kinds}"  # no audio = nothing to transcribe
    sj = job / "script.json"
    lang = json.loads(sj.read_text()).get("lang", "ko") if sj.exists() else "ko"
    shutil.copy(src, job / "raw.mp4")
    # shortcut: phone rotate-tag / landscape input not handled, add a transpose here when it shows up
    save(job, {"line": line, "raw": "raw.mp4", "duration": float(info["format"]["duration"]), "lang": lang})


def transcribe(job, model="small"):
    import numpy as np
    from faster_whisper import WhisperModel
    m, job = load(job), Path(job)
    pcm = run("ffmpeg", "-v", "error", "-i", job / "raw.mp4", "-ac", "1", "-ar", "16000", "-f", "f32le", "-")
    segs, _ = WhisperModel(model, device="cpu", compute_type="int8").transcribe(
        np.frombuffer(pcm, np.float32), language=m["lang"], word_timestamps=True, vad_filter=True,
        initial_prompt=" ".join(decisions(job).get("vocab", [])) or None)  # vocab hints fix proper nouns
    m["words"] = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    save(job, m)


def cuts(job):
    m, job = load(job), Path(job)
    keep = plan_keep(m["words"], m["duration"])
    f = ";".join(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS[a{i}]"
                 for i, (s, e) in enumerate(keep))
    f += ";" + "".join(f"[v{i}][a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[v][a]"
    run("ffmpeg", "-v", "error", "-y", "-i", job / m["raw"], "-filter_complex", f, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", job / "edited.mp4")
    m["keep"] = keep
    m["words_edit"], m["duration_edit"] = remap(m["words"], keep)
    m["edited"] = "edited.mp4"
    save(job, m)


def captions(job):
    m = load(job)
    breaks, sj = (), Path(job) / "script.json"
    if sj.exists():  # never let a caption straddle two script sentences
        breaks = {i for i, _ in segment(m["words_edit"], [b["say"] for b in json.loads(sj.read_text())["beats"]])}
    m["captions"] = chunk(m["words_edit"], decisions(job).get("emphasis", []), breaks=breaks)
    save(job, m)


def scenes(job):
    """Time every beat's visuals to the sentence being spoken. No script.json -> no-op (decisions.json scenes still work)."""
    job = Path(job)
    if not (job / "script.json").exists():
        return
    m, sc = load(job), json.loads((job / "script.json").read_text())
    beats = sc["beats"]
    facts = {r["repo"]: r for r in json.loads((job / "research.json").read_text())} if (job / "research.json").exists() else {}
    words = m["words_edit"]
    runs = segment(words, [b["say"] for b in beats])
    starts = [words[i]["s"] for i, _ in runs]
    starts[0] = 0.0
    ends = starts[1:] + [m["duration_edit"]]
    ordinals = {"ko": ["첫 번째", "두 번째", "세 번째"], "en": ["First", "Second", "Third"]}.get(sc.get("lang", "ko"), [])
    steps = sc.get("steps", [])
    m["scenes"] = []
    for b, s0, e0 in zip(beats, starts, ends):
        vs = b.get("visuals", [])
        for q, v in enumerate(vs):
            d = {"layout": "top", **v}
            if "repo" in d:
                f = facts.get(d["repo"], {})
                d.setdefault("title", d["repo"].split("/")[-1])
                d.setdefault("url", f"github.com/{d['repo']}")
                d.setdefault("sub", f.get("desc") or "")
                stars = f.get("stars")
                if stars is not None and "stats" not in d:
                    txt = f"{stars / 1000:.1f}k" if stars >= 1000 else str(stars)
                    d["stats"], d["badge"] = [{"k": "stars", "v": txt}], f"★ {txt}"
            if isinstance(d.get("step"), int):
                k = d["step"]
                d["step"] = {"ordinal": ordinals[k] if k < len(ordinals) else str(k + 1), "labels": steps, "active": k}
            m["scenes"].append({"s": round(s0 + (e0 - s0) * q / len(vs), 2), "e": round(s0 + (e0 - s0) * (q + 1) / len(vs), 2), **d})
    save(job, m)


def draft(job, cps=6.0):
    """No footage yet: time every beat by its script length so the graphics can be reviewed (silent).
    Real speech later goes through `run`, which re-times everything from the audio."""
    job = Path(job)
    script(job)
    words, t = [], 0.0
    for b in json.loads((job / "script.json").read_text())["beats"]:
        ws = b["say"].split()
        d = max(2.2, len(b["say"].replace(" ", "")) / cps + 0.3)  # shortcut: flat chars/sec, real pacing differs
        step = (d - 0.3) / len(ws)
        words += [{"w": w, "s": round(t + k * step, 2), "e": round(t + (k + 1) * step, 2)} for k, w in enumerate(ws)]
        t += d
    save(job, {"line": "draft", "duration_edit": round(t, 2), "words_edit": words, "edited": ""})
    captions(job)
    scenes(job)
    render(job)


def render(job):
    m, job = load(job), Path(job).resolve()
    props = {"video": m["edited"], "duration": m["duration_edit"], "captions": m["captions"],
             "scenes": m.get("scenes") or decisions(job).get("scenes", [])}
    (job / "props.json").write_text(json.dumps(props, ensure_ascii=False))
    chrome = glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell")  # cloud container; locally Remotion fetches its own
    run("npx", "remotion", "render", "src/index.ts", "Reel", job / "final.mp4", f"--props={job / 'props.json'}",
        f"--public-dir={job}", *([f"--browser-executable={chrome[0]}"] if chrome else []), cwd=HERE / "remotion")
    m["output"] = "final.mp4"  # Line B outbox: host app uploads this file
    save(job, m)


STAGES = {"transcribe": transcribe, "cuts": cuts, "captions": captions, "scenes": scenes, "render": render}


def pipeline(job, src, line="human"):
    intake(job, src, line)
    for name, fn in STAGES.items():
        print("->", name, flush=True)
        fn(job)
    print("done:", Path(job) / "final.mp4")


def voice(job):
    from lines import ai
    script(job)
    ai.produce((Path(job) / "script.txt").read_text(), Path(job) / "footage.mp4")


def make(job):
    """script (written if missing) -> AI voice -> the whole edit."""
    import writer
    if not (Path(job) / "script.json").exists():
        writer.write(job, script)
    voice(job)
    pipeline(job, Path(job) / "footage.mp4", "ai")


if __name__ == "__main__":
    cmd, *rest = sys.argv[1:]
    if cmd == "keys":
        keys.status() if rest[:1] == ["status"] else keys.setup()
    elif cmd == "voices":
        from lines import ai
        ai.voices()
    else:
        job, *rest = rest
        if cmd == "brief":  # vp.py brief JOB "topic" [owner/repo ..]
            import writer
            writer.brief(job, rest[0], rest[1:])
        elif cmd == "write":
            import writer
            writer.write(job, script)
        elif cmd == "voice":
            voice(job)
        elif cmd == "make":
            make(job)
        elif cmd == "draft":
            draft(job)
        elif cmd == "intake":
            intake(job, *rest)
        elif cmd == "research":
            research(job, *rest)
        elif cmd == "script":
            script(job)
        elif cmd == "run":
            pipeline(job, rest[0])
        else:
            STAGES[cmd](job)
