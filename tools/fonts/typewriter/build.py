"""
build.py — Lorenzo Typewriter: a hand-drafted slab-serif monospace, and its
sans, each in four weights.

    fontforge -lang=py -script build.py <outdir> [Style ...]

Every letter is a centreline drawing from tools/skeleton.py set in a 600-unit
cell (10 characters to the inch, like the machine), expanded with a round nib
for the weight, and softened along the edge so it reads as ink pressed into
paper rather than a clean vector. The serif styles add slabs at every stem
end and short vertical serifs at arm ends; the sans keeps only a foot and a
flag on i, j and l so a column of them still reads.

  Lorenzo Typewriter       Thin 100 · Light 300 · Regular 400 · Bold 700
  Lorenzo Typewriter Sans  Thin 100 · Light 300 · Regular 400 · Bold 700
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
sys.path.insert(0, TOOLS)
sys.path.insert(0, os.path.join(TOOLS, "longhand"))
import fontkit  # noqa: E402
import skeleton  # noqa: E402
from pen import K, cubics  # noqa: E402

COPYRIGHT = "Copyright 2026 Lorenzo Scardicchio. Drawn as centrelines in tools/skeleton.py; an original hand-drafted typewriter face."
DESCRIPTOR_SERIF = "A soft, hand-drafted slab-serif monospace: ten characters to the inch, slabs on every stem, ink pressed into paper."
DESCRIPTOR_SANS = "The sans of Lorenzo Typewriter: the same ten-to-the-inch cell and soft ink, without the slabs."

CELL = 600
METRICS = skeleton.Metrics(C=600, X=430, A=640, D=-200, geometric=False, dot=12)
WEIGHTS = {"Thin": (100, 28), "Light": (300, 46), "Regular": (400, 68), "Bold": (700, 96)}
VSERIF = 100
GRIT = 0.55


def scaled_to_fit(g, nib):
    """Letters drawn wider than the cell (W, m, the em dash) are condensed to
    fit; everything else keeps its drawn width and is centred."""
    maxw = CELL - nib - 44
    if g["width"] > maxw and g["width"] > 0:
        f = maxw / g["width"]
        for s in g["strokes"]:
            for k in s:
                k["p"] = (k["p"][0] * f, k["p"][1])
                a = math.radians(k["a"])
                k["a"] = math.degrees(math.atan2(math.sin(a), math.cos(a) * f))
                for key in ("hin", "hout"):
                    if k[key] is not None:
                        k[key] = k[key] * math.hypot(math.cos(a) * f, math.sin(a))
        g["slabs"] = [(x * f, y, h) for (x, y, h) in g["slabs"]]
        g["vserifs"] = [(x * f, y, d) for (x, y, d) in g["vserifs"]]
        g["width"] *= f
    return g


def placed(g, nib, name):
    """Shift the drawing into the cell and add the serif strokes."""
    margin = nib / 2 + 14
    if name in ("emdash", "underscore"):
        x0 = margin
        f = (CELL - 2 * margin) / g["width"]
        for s in g["strokes"]:
            for k in s:
                k["p"] = (k["p"][0] * f, k["p"][1])
        g["width"] *= f
    else:
        x0 = (CELL - g["width"]) / 2
    strokes = []
    for s in g["strokes"]:
        strokes.append([{"p": (k["p"][0] + x0, k["p"][1]), "a": k["a"], "hin": k["hin"], "hout": k["hout"]} for k in s])
    slabs = [(x + x0, y, h) for (x, y, h) in g["slabs"]]
    vserifs = [(x + x0, y, d) for (x, y, d) in g["vserifs"]]
    return strokes, slabs, vserifs, margin


def slab_strokes(slabs, margin):
    out = []
    for (x, y, half) in slabs:
        left = max(margin, x - half)
        right = min(CELL - margin, x + half)
        if right - left > 20:
            out.append(skeleton.line(left, y, right, y))
    return out


def vserif_strokes(vserifs):
    return [skeleton.line(x, y, x, y + d * VSERIF) for (x, y, d) in vserifs if d]


def sans_feet(name, strokes, margin):
    """The sans keeps i, j and l readable in a column: a foot and a flag."""
    out = []
    if name in ("i", "dotlessi"):
        x = strokes[0][0]["p"][0]
        top = strokes[0][1]["p"][1]
        out.append(skeleton.line(max(margin, x - 80), 0, min(CELL - margin, x + 80), 0))
        out.append(skeleton.line(x - 90, top, x, top))
    return out


def build(variant, weight_name, outdir):
    weight, nib = WEIGHTS[weight_name]
    serif = variant == "Serif"
    family = "Lorenzo Typewriter" if serif else "Lorenzo Typewriter Sans"
    f = fontkit.new_font(family, weight_name, weight, ascent=780, descent=220, xheight=METRICS.X, capheight=METRICS.C,
                         copyright=COPYRIGHT, descriptor=DESCRIPTOR_SERIF if serif else DESCRIPTOR_SANS, monospace=True)
    fallbacks = []
    for name in skeleton.SK:
        g = scaled_to_fit(skeleton.draw(name, METRICS), nib)
        strokes, slabs, vserifs, margin = placed(g, nib, name)
        if serif:
            strokes += slab_strokes(slabs, margin) + vserif_strokes(vserifs)
        else:
            strokes += sans_feet(name, strokes, margin)
        uni = g["uni"]
        glyph = f.createChar(uni, name) if uni is not None else f.createChar(-1, name)
        glyph.foreground = fontkit.layer_from_segments([cubics(s) for s in strokes], lambda p: p)
        if fontkit.expand(glyph, nib):
            fallbacks.append(name)
        fontkit.roughen(glyph, GRIT, seed=sum(map(ord, name)) + weight, wobble=(1.8, 1.2, 0.7), jitter=1.1, notch=0.02)
        glyph.width = CELL

    fontkit.add_spaces(f, CELL, thin=CELL)
    for uni, base_name, mark_name in fontkit.COMPOSITES:
        fontkit.compose(f, uni, base_name, mark_name, slant=0.0, cap_lift=METRICS.C - METRICS.X)

    base = ("LorenzoTypewriter" if serif else "LorenzoTypewriterSans") + "-" + weight_name
    ttf, woff2 = fontkit.write(f, outdir, base)
    print(f"{family} {weight_name} -> {os.path.basename(ttf)} {os.path.getsize(ttf)} bytes; {os.path.basename(woff2)} {os.path.getsize(woff2)} bytes; fallback on: {', '.join(fallbacks) or 'none'}")
    f.close()


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out")
    os.makedirs(outdir, exist_ok=True)
    wanted = sys.argv[2:]
    for variant in ("Serif", "Sans"):
        for weight_name in WEIGHTS:
            if wanted and f"{variant}-{weight_name}" not in wanted and variant not in wanted:
                continue
            build(variant, weight_name, outdir)
