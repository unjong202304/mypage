#!/usr/bin/env python3
"""Reel pipeline. Each stage reads/writes <job>/manifest.json (contract: README.md).
Usage: vp.py research JOB owner/repo.. | script JOB | intake JOB VIDEO | transcribe JOB | cuts JOB | captions JOB | scenes JOB | render JOB | run JOB VIDEO"""
import glob, json, os, shutil, subprocess, sys, urllib.request
from difflib import SequenceMatcher
from pathlib import Path

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


def chunk(words, emph, max_words=3, max_chars=14):
    chunks, cur = [], []

    def flush():
        if cur:
            chunks.append({"s": cur[0]["s"], "e": cur[-1]["e"], "text": " ".join(x["w"] for x in cur),
                           "hl": [i for i, x in enumerate(cur) if any(k in x["w"] for k in emph)]})
            cur.clear()

    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(x["w"] for x in cur + [w])) > max_chars):
            flush()
        cur.append(w)
    flush()
    for a, b in zip(chunks, chunks[1:]):  # hold caption through short gaps, no flicker
        a["e"] = round(min(b["s"], a["e"] + 0.3), 2)
    return chunks


def align(words, sentences, item_idx, anchors, duration, tail=5.0):
    """Scene spans for script items. Prefer spoken anchor words; else place by sentence length."""
    starts, i = [], 0
    for a in anchors:
        j = next((k for k in range(i, len(words)) if a and SequenceMatcher(None, a.lower(), words[k]["w"].lower()).ratio() >= 0.6), None)
        if j is None:
            starts = None
            break
        starts.append(words[j]["s"] - 0.2)
        i = j + 1
    if starts is None:  # shortcut: assumes an even speech rate, upgrade to forced alignment when drift shows
        total = sum(map(len, sentences))
        starts = [sum(map(len, sentences[:k])) / total * duration for k in item_idx]
    starts = [max(0, x) for x in starts]
    ends = [b - 0.1 for b in starts[1:]] + [min(duration, starts[-1] + tail)]
    return [[round(a, 2), round(b, 2)] for a, b in zip(starts, ends)]


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
            h = {"User-Agent": "vp"} | ({"Authorization": "Bearer " + os.environ["GITHUB_TOKEN"]} if "GITHUB_TOKEN" in os.environ else {})
            d = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.github.com/repos/{r}", headers=h), timeout=15))
            item |= {"desc": d["description"], "stars": d["stargazers_count"], "url": d["html_url"]}
        except Exception as e:
            print(f"warn: {r}: no GitHub metadata ({e}); fill {p} by hand", file=sys.stderr)
    p.write_text(json.dumps(list(have.values()), ensure_ascii=False, indent=1))


def sentences(sc):
    return [sc["hook"]] + [i["say"] for i in sc["items"]] + [sc["result"], sc["cta"]]


def script(job):
    """Validate the LLM-written script.json, emit script.txt (to the shooter / TTS) and vocab+emphasis hints."""
    job = Path(job)
    sc = json.loads((job / "script.json").read_text())
    assert sc["items"] and all(i.get("repo") and i.get("say") for i in sc["items"]), "items need repo+say"
    assert sc.get("hook") and sc.get("result") and sc.get("cta"), "need hook, result, cta"
    (job / "script.txt").write_text("\n".join(sentences(sc)) + "\n")
    d = decisions(job)
    d["vocab"] = [i["repo"].split("/")[-1] for i in sc["items"]] + [a for i in sc["items"] if (a := i.get("anchor"))] + sc.get("vocab", [])
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
    m["captions"] = chunk(m["words_edit"], decisions(job).get("emphasis", []))
    save(job, m)


def scenes(job):
    """Time scene cards to the spoken items. No script.json -> no-op (decisions.json scenes still work)."""
    job = Path(job)
    if not (job / "script.json").exists():
        return
    m, sc = load(job), json.loads((job / "script.json").read_text())
    facts = {r["repo"]: r for r in json.loads((job / "research.json").read_text())} if (job / "research.json").exists() else {}
    sens, items = sentences(sc), sc["items"]
    spans = align(m["words_edit"], sens, range(1, 1 + len(items)), [i.get("anchor", "") for i in items], m["duration_edit"])
    m["scenes"] = []
    for i, (s, e) in zip(items, spans):
        f = facts.get(i["repo"], {})
        m["scenes"].append({"s": s, "e": e, "title": i.get("title") or i["repo"].split("/")[-1],
                            "sub": i.get("label") or f.get("desc") or "",
                            **({"badge": f"★ {f['stars'] / 1000:.1f}k" if f["stars"] >= 1000 else f"★ {f['stars']}"} if f.get("stars") is not None else {})})
    save(job, m)


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

if __name__ == "__main__":
    cmd, job, *rest = sys.argv[1:]
    if cmd == "intake":
        intake(job, *rest)
    elif cmd == "research":
        research(job, *rest)
    elif cmd == "script":
        script(job)
    elif cmd == "run":
        intake(job, rest[0])
        for name, fn in STAGES.items():
            print("->", name, flush=True)
            fn(job)
        print("done:", Path(job) / "final.mp4")
    else:
        STAGES[cmd](job)
