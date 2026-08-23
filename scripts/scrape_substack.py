#!/usr/bin/env python3
"""One-time scraper: pulls all public posts from lorenzoscardicchio.substack.com
into content/posts/*.json with images localized under public/posts/<slug>/."""
import json, re, os, time, urllib.request, urllib.parse, hashlib

BASE = "https://lorenzoscardicchio.substack.com"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read()

def original_url(cdn_url):
    # substackcdn fetch URLs end with the URL-encoded original
    m = re.search(r'https%3A%2F%2F.+$', cdn_url)
    return urllib.parse.unquote(m.group(0)) if m else cdn_url

def download_image(url, slug, idx):
    orig = original_url(url)
    ext = os.path.splitext(urllib.parse.urlparse(orig).path)[1] or ".png"
    if len(ext) > 5: ext = ".png"
    name = f"img-{idx}{ext}"
    d = os.path.join(ROOT, "public", "posts", slug)
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, name)
    if not os.path.exists(path):
        try:
            data = get(orig)
        except Exception:
            data = get(url)  # fall back to CDN url
        with open(path, "wb") as f: f.write(data)
        time.sleep(0.4)
    return f"/posts/{slug}/{name}"

archive = json.loads(get(f"{BASE}/api/v1/archive?sort=new&offset=0&limit=50"))
manifest = []
for meta in archive:
    slug = meta["slug"]
    post = json.loads(get(f"{BASE}/api/v1/posts/{slug}"))
    body = post.get("body_html") or ""
    # localize inline images
    idx = 0
    seen = {}
    def repl(m):
        global idx
        src = m.group(1)
        if src not in seen:
            idx += 1
            seen[src] = download_image(src, slug, idx)
        return f'src="{seen[src]}"'
    body = re.sub(r'src="(https://substackcdn\.com/image/fetch/[^"]+)"', repl, body)
    # strip srcset (points at CDN) so local src wins
    body = re.sub(r'\s(?:srcset|sizes)="[^"]*"', "", body)
    cover = meta.get("cover_image")
    cover_local = download_image(cover, slug, 0) if cover else None
    words = meta.get("wordcount") or len(re.sub(r"<[^>]+>", " ", body).split())
    rec = {
        "slug": slug,
        "title": post.get("title") or meta["title"],
        "subtitle": post.get("subtitle") or meta.get("subtitle") or "",
        "date": meta["post_date"],
        "cover": cover_local,
        "wordcount": words,
        "readMinutes": max(1, round(words / 200)),
        "description": meta.get("description") or "",
        "canonical": meta.get("canonical_url"),
        "bodyHtml": body,
    }
    with open(os.path.join(ROOT, "content", "posts", f"{slug}.json"), "w") as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
    manifest.append({k: rec[k] for k in ("slug","title","subtitle","date","cover","wordcount","readMinutes","description")})
    print(f"ok  {slug}  ({words}w, {idx} images)")
    time.sleep(0.5)

with open(os.path.join(ROOT, "content", "posts", "index.json"), "w") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f"\n{len(manifest)} posts written")
