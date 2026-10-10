"""Offline checks for keys / ElevenLabs request / script writer. No network, no real keys."""
import io
import json
import os
import stat
import subprocess
import tempfile
from pathlib import Path
from unittest import mock

import keys
import writer
from lines import ai

tmp = Path(tempfile.mkdtemp())

# keys: hidden-input setup writes an owner-only file; real env wins over the file
keys.ENV = tmp / ".env"
with mock.patch("keys.getpass.getpass", side_effect=["sk-abcd1234", "", "", "", "", ""]), mock.patch("builtins.input", return_value="voiceX"):
    keys.setup()
assert stat.S_IMODE(keys.ENV.stat().st_mode) == 0o600
assert keys.get("ELEVENLABS_API_KEY") == "sk-abcd1234" and keys.get("ELEVENLABS_VOICE_ID") == "voiceX"
with mock.patch.dict(os.environ, {"ELEVENLABS_API_KEY": "from-env"}):
    assert keys.get("ELEVENLABS_API_KEY") == "from-env"

# ElevenLabs: right URL, key header and body; the returned audio ends up in a portrait mp4 with sound
mp3 = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1", "-f", "mp3", "-"], capture_output=True, check=True).stdout
seen = {}


def fake_open(req, timeout=0):
    seen.update(url=req.full_url, key=req.get_header("Xi-api-key"), body=json.loads(req.data))
    return io.BytesIO(mp3)


with mock.patch("urllib.request.urlopen", fake_open):
    out = ai.produce("안녕하세요", tmp / "footage.mp4")
assert "/text-to-speech/voiceX?output_format=mp3_44100_128" in seen["url"] and seen["key"] == "sk-abcd1234", seen
assert seen["body"] == {"text": "안녕하세요", "model_id": "eleven_multilingual_v2"}, seen
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", out], capture_output=True, check=True).stdout)
assert {s["codec_type"] for s in info["streams"]} == {"video", "audio"}
assert (info["streams"][0]["width"], info["streams"][0]["height"]) == (720, 1280)

# writer: brief carries the facts; a bad first reply is retried with the error, then accepted
with mock.patch("writer.readme", return_value="FACT: 335 lines became 10"):
    writer.brief(tmp / "j", "포니테일", ["a/b"])
b = (tmp / "j" / "brief.md").read_text()
assert "FACT: 335 lines became 10" in b and "포니테일" in b and "Never invent numbers" in b.replace("never invent numbers", "Never invent numbers")
replies = iter(["no json here", 'Sure!\n```json\n{"lang":"ko","beats":[{"say":"안녕","visuals":[]}]}\n```'])
prompts = []
with mock.patch("writer.llm", side_effect=lambda p: (prompts.append(p), next(replies))[1]):
    writer.write(tmp / "j", lambda job: (_ for _ in ()).throw(AssertionError("x")) if not json.loads((Path(job) / "script.json").read_text()).get("beats") else None)
assert "rejected" in prompts[1] and json.loads((tmp / "j" / "script.json").read_text())["beats"][0]["say"] == "안녕"
print("ok")
