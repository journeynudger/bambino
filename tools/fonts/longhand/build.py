"""
build.py — turn the pen strokes in glyphs.py into font files.

    python3 build.py <outdir> [Style ...] [--preview out.png]

For each style the centrelines are slanted, stroked with a round nib of the
style's width, overlaps removed, and (Graphite only) pushed about along the
outline so the edge reads as pencil on paper rather than a clean vector.
Accented Latin-1 letters are composed from the base letters and the accent
marks. Output: LorenzoLonghand-<Style>.ttf and .woff2.

  Ballpoint  thin, clean         (weight 300)
  Graphite   medium, gritty edge (weight 400)
  Inkwell    heavy, clean        (weight 600)

--preview also renders the finished fonts as a sheet of sample lines, so a
change to a letter can be judged in seconds. Needs skia-pathops, fonttools,
brotli and (for the preview) Pillow.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.dirname(HERE))
import ttbuild  # noqa: E402
from pen import cubics, shear, H, SLANT  # noqa: E402
from glyphs import GLYPHS  # noqa: E402

FAMILY = "Lorenzo Longhand"
COPYRIGHT = "Copyright 2026 Lorenzo Scardicchio. Drawn as pen strokes in tools/fonts/longhand; an original monoline longhand."
DESCRIPTOR = "A monoline Palmer-method longhand: looped ascenders, oval bowls, every lowercase letter joining the next."

STYLES = {
    "Ballpoint": dict(width=22, grit=0.0, weight=300),
    "Graphite": dict(width=34, grit=1.0, weight=400),
    "Inkwell": dict(width=50, grit=0.0, weight=600),
}
MARK_LIFT_FOR_CAPS = 300  # marks are drawn for the x-height; capitals need them higher


def build(style, opts, outdir):
    paths = {}
    for name, gd in GLYPHS.items():
        path = ttbuild.path_from_strokes([cubics(s) for s in gd["strokes"]], shear)
        path = ttbuild.expand(path, opts["width"])
        if opts["grit"]:
            path = ttbuild.jitter(path, opts["grit"], seed=sum(map(ord, name)))
        paths[name] = (path, gd["adv"], gd["uni"])
    for uni, base_name, mark_name in ttbuild.COMPOSITES:
        base, adv, _ = paths[base_name]
        mark = paths[mark_name][0]
        paths[f"uni{uni:04X}"] = (ttbuild.compose(base, mark, base_name, mark_name, SLANT, MARK_LIFT_FOR_CAPS), adv, uni)
    ttf, woff2 = ttbuild.build(
        family=FAMILY, style=style, weight=opts["weight"], glyphs=paths, outdir=outdir, basename=f"LorenzoLonghand-{style}",
        ascent=780, descent=220, xheight=H, capheight=660, italic_angle=-math.degrees(math.atan(SLANT)),
        copyright=COPYRIGHT, descriptor=DESCRIPTOR, space=330, thin_space=140,
    )
    print(style, "->", os.path.basename(ttf), os.path.getsize(ttf), "bytes;", os.path.basename(woff2), os.path.getsize(woff2), "bytes;", len(paths) + 4, "glyphs")
    return ttf


SAMPLE = [
    ("Inkwell", "Lorenzo Scardicchio", 150),
    ("Ballpoint", "Try Out Lorenzo Longhand Ballpoint...", 96),
    ("Graphite", "Try Out Lorenzo Longhand Graphite...", 96),
    ("Inkwell", "Try Out Lorenzo Longhand Inkwell...", 96),
    ("Inkwell", "abcdefghijklmnopqrstuvwxyz", 96),
    ("Inkwell", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 96),
    ("Inkwell", "0123456789 .,;:!? ’ “ ” - ( ) &", 96),
    ("Ballpoint", "the quick brown fox jumps over the lazy dog", 84),
]


def preview(ttfs, out):
    from PIL import Image, ImageDraw, ImageFont
    rows = []
    for style, text, size in SAMPLE:
        font = ImageFont.truetype(ttfs[style], size)
        rows.append((font, text, size))
    width = 2200
    height = sum(int(size * 1.75) for _f, _t, size in rows) + 60
    im = Image.new("RGB", (width, height), (236, 226, 192))
    d = ImageDraw.Draw(im)
    y = 30
    for font, text, size in rows:
        d.line([(0, y + size * 1.1), (width, y + size * 1.1)], fill=(205, 192, 150), width=1)
        d.text((60, y), text, font=font, fill=(42, 37, 30))
        y += int(size * 1.75)
    im.save(out)
    print("preview ->", out)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out_png = sys.argv[sys.argv.index("--preview") + 1] if "--preview" in sys.argv else None
    if out_png:
        args = [a for a in args if a != out_png]
    outdir = args[0] if args else os.path.join(HERE, "out")
    os.makedirs(outdir, exist_ok=True)
    only = args[1:] or list(STYLES)
    ttfs = {style: build(style, STYLES[style], outdir) for style in only}
    if out_png:
        missing = [s for s, _t, _z in SAMPLE if s not in ttfs]
        for s in set(missing):
            ttfs[s] = build(s, STYLES[s], outdir)
        preview(ttfs, out_png)
