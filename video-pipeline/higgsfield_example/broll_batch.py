"""Generate a set of B-roll clips with Higgsfield Seedance 2.5 text-to-video (BILLABLE) and download them. Run on YOUR machine:
    python broll_batch.py            # shows the plan, asks before spending
    python broll_batch.py --yes      # no question
    python broll_batch.py --only 1,4 # just those numbers
Needs HF_KEY (key-id:key-secret) in .env.local like main.py. The key is never printed. Clips land in ./broll/ ; existing files are skipped."""
import argparse, os, sys, urllib.request
from pathlib import Path
from dotenv import load_dotenv
import higgsfield_client as hf

load_dotenv(Path(__file__).parent / ".env.local")
MODEL = "bytedance/seedance-2.5/text-to-video"
NEG = " No text, no letters, no logos, no watermark, no brand names, no subtitles."
CLIPS = [  # (file name, prompt)
    ("01_tired_editor_night", "Cinematic vertical shot, a tired Korean male YouTuber in a dark hoodie at his late-night editing desk, curved monitor showing a video timeline, red ambient light, he rubs his eyes, slow handheld push, shallow depth of field, moody and realistic." + NEG),
    ("02_hands_timeline", "Close-up of hands on a keyboard and mouse editing a video timeline at night, monitor glow reflecting on the desk, shallow depth of field, slow lateral camera slide, realistic, 24fps film look." + NEG),
    ("03_clock_time_passing", "Time-lapse of a desk clock and a computer screen glow through the night turning into morning light through a window, video editing desk, realistic cinematic, vertical." + NEG),
    ("04_owner_filming_shop", "A friendly Korean small-shop owner films herself with a smartphone on a gimbal inside a cozy small store, warm natural light, she smiles at the camera, vertical handheld, realistic." + NEG),
    ("05_creator_relieved_cafe", "A relaxed Korean male creator drinks coffee at a bright cafe table and looks at his smartphone, then smiles with relief, morning sunlight, shallow depth of field, realistic, vertical." + NEG),
    ("06_phone_notification", "Close-up of a smartphone on a wooden table lighting up with a chat notification, a hand picks it up, soft warm light, shallow depth of field, realistic, vertical." + NEG),
    ("07_film_strip_ruby", "Abstract cinematic macro: a glossy black film strip twisting in space with a ruby-red glowing triangle, studio lighting, dark background, slow elegant rotation, 3D render look." + NEG),
    ("08_shorts_grid_motion", "Vertical short-form video collage concept: several glowing phone screens floating in a dark studio, each playing colorful abstract footage, slow parallax motion, premium tech commercial look." + NEG),
]


def find_url(o):
    if isinstance(o, dict):
        if isinstance(o.get("url"), str): return o["url"]
        for v in o.values():
            u = find_url(v)
            if u: return u
    if isinstance(o, list):
        for v in o:
            u = find_url(v)
            if u: return u


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--yes", action="store_true"); ap.add_argument("--only", default="")
    a = ap.parse_args()
    pick = {int(x) for x in a.only.split(",") if x.strip()} or set(range(1, len(CLIPS) + 1))
    todo = [(i, n, p) for i, (n, p) in enumerate(CLIPS, 1) if i in pick]
    out = Path(__file__).parent / "broll"; out.mkdir(exist_ok=True)
    todo = [t for t in todo if not (out / f"{t[1]}.mp4").exists()]
    print(f"{len(todo)} clip(s) to generate (5 s, 720p, 9:16 each; each one is billed to your Higgsfield account):")
    for i, n, _ in todo: print(f"  {i}. {n}")
    if not todo: return 0
    if not a.yes and input("Continue? [y/N] ").strip().lower() != "y": return 1
    fails = 0
    for i, n, p in todo:
        last = {"s": None}
        def upd(s):
            last["s"] = type(s).__name__
        try:
            res = hf.subscribe(MODEL, arguments={"prompt": p, "duration": 5, "resolution": "720p", "aspect_ratio": "9:16"}, on_queue_update=upd)
        except hf.CredentialsMissedError:
            sys.exit("HF_KEY missing (key-id:key-secret) in .env.local")
        except hf.InsufficientCreditsError:
            print("Not enough Higgsfield credits - stopping."); return 1
        except Exception as e:
            print(f"{i}. {n}: FAILED {type(e).__name__}: {str(e)[:200]}"); fails += 1; continue
        if last["s"] in ("Failed", "NSFW", "Cancelled"):
            print(f"{i}. {n}: {last['s']}"); fails += 1; continue
        url = find_url(res)
        if not url: print(f"{i}. {n}: no url in result"); fails += 1; continue
        urllib.request.urlretrieve(url, out / f"{n}.mp4"); print(f"{i}. {n}: saved ({url[:60]}...)")
    print("done" if not fails else f"done with {fails} failure(s)")
    return 1 if fails else 0


sys.exit(main())
