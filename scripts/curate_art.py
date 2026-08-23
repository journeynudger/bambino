#!/usr/bin/env python3
"""Curated artwork pull: only Lorenzo's own work, alpha-preserving for ink/calligraphy PNGs."""
import json, os, re, subprocess, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
OUT = os.path.join(ROOT, "public", "art")
os.makedirs(OUT, exist_ok=True)

KEEP = [
    (r"^calligraphy", "calligraphy"),
    (r"^Bambino_painting", "painting"),
    (r"^bambino_dj", "dj"),
    (r"^dj_37", "dj"),
    (r"^LS_bambinologo", "logo"),
    (r"^Primal-Stairway", "logo"),
    (r"^Lorenzo_headshot|^author_03|^portrait-square", "portrait"),
    (r"^book-cover", "book"),
    (r"^Journey-Nudge-Designs", "design"),
    (r"^app-0", "design"),
    (r"^IMG_5663", "painting"),
    (r"^(1|2|3|4)\.png$", "design"),
    (r"^(10|11|12|13)\.png$", "design"),
]

def match(fname):
    for pat, cat in KEEP:
        if re.match(pat, fname, re.I): return cat
    return None

items, page = [], 1
while True:
    url = f"https://lorenzoscardicchio.com/wp-json/wp/v2/media?per_page=100&page={page}"
    try:
        req = urllib.request.Request(url, headers=UA)
        batch = json.loads(urllib.request.urlopen(req, timeout=30).read())
    except Exception:
        break
    if not batch: break
    items += batch
    if len(batch) < 100: break
    page += 1

manifest, seen = [], set()
for it in items:
    d = it.get("media_details", {}) or {}
    w, h = d.get("width") or 0, d.get("height") or 0
    src = it.get("source_url") or ""
    fname = os.path.basename(src)
    if "cropped-" in fname or w < 350: continue
    cat = match(fname)
    if not cat or fname in seen: continue
    seen.add(fname)
    raw = os.path.join("/tmp", fname)
    try:
        req = urllib.request.Request(src, headers=UA)
        with open(raw, "wb") as f:
            f.write(urllib.request.urlopen(req, timeout=60).read())
    except Exception as e:
        print("skip", fname, e); continue
    is_png = fname.lower().endswith(".png")
    base = re.sub(r"\.(png|jpe?g|webp)$", "", fname, flags=re.I)
    base = re.sub(r"-e\d{10,}$", "", base)  # strip WP edit suffixes
    if is_png:
        out_name, fmt, opts = base + ".png", "png", []
    else:
        out_name, fmt, opts = base + ".jpg", "jpeg", ["-s", "formatOptions", "82"]
    out_path = os.path.join(OUT, out_name)
    subprocess.run(["sips", "-s", "format", fmt, *opts,
                    "--resampleHeightWidthMax", "1400", raw, "--out", out_path],
                   capture_output=True)
    os.remove(raw)
    if not os.path.exists(out_path): print("fail", fname); continue
    manifest.append({"file": f"/art/{out_name}",
                     "title": (it.get("title", {}) or {}).get("rendered", base),
                     "category": cat, "w": w, "h": h})
    time.sleep(0.2)

manifest.sort(key=lambda m: (m["category"], m["file"]))
with open(os.path.join(ROOT, "content", "art.json"), "w") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
from collections import Counter
print(Counter(m["category"] for m in manifest)); print(len(manifest), "kept")
