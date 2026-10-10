"""API keys: the real environment wins, else video-pipeline/.env. `vp.py keys` fills .env with hidden input."""
import getpass
import os
from pathlib import Path

ENV = Path(__file__).parent / ".env"
NAMES = {  # name -> is secret
    "ELEVENLABS_API_KEY": True, "ELEVENLABS_VOICE_ID": False,
    "ANTHROPIC_API_KEY": True, "DEEPSEEK_API_KEY": True,
    "HIGGSFIELD_API_KEY": True, "GITHUB_TOKEN": True,
}


def _file():
    out = {}
    if ENV.exists():
        for line in ENV.read_text().splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip("\"'")
    return out


def get(name):
    return os.environ.get(name) or _file().get(name, "")


def _shown(name, v):
    return "-" if not v else (f"set (...{v[-4:]})" if NAMES.get(name, True) else v)


def status():
    for n in NAMES:
        print(f"{n:22} {_shown(n, get(n))}")


def setup():
    cur = _file()
    for n, secret in NAMES.items():
        v = (getpass.getpass if secret else input)(f"{n} [{_shown(n, cur.get(n, ''))}] (Enter = keep): ").strip()
        if v:
            cur[n] = v
    fd = os.open(ENV, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)  # owner-only from the first byte
    with os.fdopen(fd, "w") as f:
        f.write("".join(f"{k}={v}\n" for k, v in cur.items()))
    print(f"saved to {ENV}")
    status()
