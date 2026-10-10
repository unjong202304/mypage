"""Script writer: facts + concept template -> brief.md (any agent can answer it) or an LLM API call that writes script.json."""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import keys

HERE = Path(__file__).parent


def readme(repo, limit=5000):
    for b in ("main", "master"):
        try:
            return urllib.request.urlopen(f"https://raw.githubusercontent.com/{repo}/{b}/README.md", timeout=15).read().decode()[:limit]
        except urllib.error.HTTPError:
            continue
    sys.exit(f"no README found for {repo}")


def brief(job, topic, repos=(), secs=20, concept="ai-tools-roundup"):
    job = Path(job)
    job.mkdir(parents=True, exist_ok=True)
    facts = "\n\n".join(f"## {r}\n{readme(r)}" for r in repos) or "(none: use only what the topic itself states)"
    (job / "brief.md").write_text(f"""# Task
Write script.json for a ~{secs}s vertical short about: {topic}
Reply with ONLY the JSON object.

# Concept
{(HERE / 'concepts' / (concept + '.md')).read_text()}

# Example (a finished script on a DIFFERENT topic: copy the shape, never its facts)
{(HERE / 'examples' / 'ponytail' / 'script.json').read_text()}

# Facts (the ONLY source of numbers and claims)
{facts}
""")


def llm(prompt):
    prov = os.environ.get("VP_LLM") or ("anthropic" if keys.get("ANTHROPIC_API_KEY") else "deepseek")
    msgs = [{"role": "user", "content": prompt}]
    if prov == "anthropic":
        key = keys.get("ANTHROPIC_API_KEY") or sys.exit("set ANTHROPIC_API_KEY (vp.py keys)")
        url, h = "https://api.anthropic.com/v1/messages", {"x-api-key": key, "anthropic-version": "2023-06-01"}
        body = {"model": os.environ.get("VP_MODEL", "claude-sonnet-5-5"), "max_tokens": 4000, "messages": msgs}
        pick = lambda r: r["content"][0]["text"]
    else:
        key = keys.get("DEEPSEEK_API_KEY") or sys.exit("set DEEPSEEK_API_KEY or ANTHROPIC_API_KEY (vp.py keys)")
        url, h = "https://api.deepseek.com/chat/completions", {"Authorization": "Bearer " + key}
        body = {"model": os.environ.get("VP_MODEL", "deepseek-chat"), "messages": msgs}
        pick = lambda r: r["choices"][0]["message"]["content"]
    req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **h})
    try:
        return pick(json.load(urllib.request.urlopen(req, timeout=180)))
    except urllib.error.HTTPError as e:
        sys.exit(f"{prov} {e.code}: {e.read().decode(errors='replace')[:300]}")
    except urllib.error.URLError as e:
        sys.exit(f"cannot reach {prov} ({e.reason})")


def write(job, validate, tries=2):
    """Ask the LLM for script.json, validate it, and show it its own error once if it was wrong."""
    job = Path(job)
    prompt, err = (job / "brief.md").read_text(), ""
    for _ in range(tries):
        out = llm(prompt + (f"\n\nYour previous reply was rejected: {err}\nFix it. JSON only." if err else ""))
        m = re.search(r"\{.*\}", out, re.S)
        try:
            (job / "script.json").write_text(json.dumps(json.loads(m.group(0)) if m else {}, ensure_ascii=False, indent=1))
            validate(job)
            return
        except (ValueError, AssertionError, KeyError) as e:
            err = repr(e)
    sys.exit(f"no valid script after {tries} tries: {err}")
