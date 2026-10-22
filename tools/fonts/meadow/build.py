"""
build.py — Lorenzo Meadow: the prairie family.

    fontforge -lang=py -script build.py <outdir> [Style ...]

  Lorenzo Meadow Script     a thin print-script, each letter on its own     (400)
  Lorenzo Meadow Stitched   the same script sewn as a running stitch        (400)
  Lorenzo Meadow Sans       a wide, light, hand-drawn geometric sans   Light 300 · Regular 400
  Lorenzo Meadow Ornaments  fourteen sprigs, bows and blossoms on a–n       (400)

The script and the stitch share tools/meadow/script_glyphs.py (lowercase)
with the Longhand capitals and figures; the sans is tools/skeleton.py drawn
wide and single-storey; the ornaments are tools/meadow/ornaments.py.
"""
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
sys.path.insert(0, HERE)
sys.path.insert(0, TOOLS)
sys.path.insert(0, os.path.join(TOOLS, "longhand"))
import fontkit  # noqa: E402
import skeleton  # noqa: E402
from pen import cubics  # noqa: E402
from script_glyphs import SCRIPT, SLANT as SCRIPT_SLANT, X as SCRIPT_X  # noqa: E402
from ornaments import ORN  # noqa: E402

COPYRIGHT = "Copyright 2026 Lorenzo Scardicchio. Drawn as pen strokes in tools/meadow; an original prairie family."
SANS_METRICS = skeleton.Metrics(C=560, X=400, A=600, D=-180, geometric=True, dot=10, xscale=1.3)
SANS_SIDE = 62


def shear(k):
    return lambda p: (p[0] + k * p[1], p[1])


def build_script(outdir, stitched):
    style = "Stitched" if stitched else "Script"
    family = f"Lorenzo Meadow {style}"
    f = fontkit.new_font(family, "Regular", 400, ascent=820, descent=320, xheight=SCRIPT_X, capheight=660, italic_angle=-10.2, copyright=COPYRIGHT,
                         descriptor="A thin print-script with tall, airy ascenders; every letter standing on its own." if not stitched else
                         "Lorenzo Meadow Script sewn as a running stitch.")
    nib = 15 if stitched else 17
    fallbacks = []
    for name, gd in SCRIPT.items():
        uni = gd["uni"]
        glyph = f.createChar(uni, name) if uni is not None else f.createChar(-1, name)
        segs = [cubics(s) for s in gd["strokes"]]
        if stitched:
            dashed = []
            for i, s in enumerate(segs):
                dashed += fontkit.dashify(s, dash=30, gap=24, phase=(i * 11) % 20)
            segs = dashed
        glyph.foreground = fontkit.layer_from_segments(segs, shear(SCRIPT_SLANT))
        if fontkit.expand(glyph, nib):
            fallbacks.append(name)
        if not stitched:
            fontkit.roughen(glyph, 0.3, seed=sum(map(ord, name)), wobble=(1.4, 1.0, 0.6), jitter=0.9, notch=0.0)
        glyph.width = int(gd["adv"] + 95)
    fontkit.add_spaces(f, 300, thin=120)
    for uni, base_name, mark_name in fontkit.COMPOSITES:
        fontkit.compose(f, uni, base_name, mark_name, slant=SCRIPT_SLANT, cap_lift=320)
    ttf, woff2 = fontkit.write(f, outdir, f"LorenzoMeadow-{style}")
    print(f"{family} -> {os.path.basename(ttf)} {os.path.getsize(ttf)} bytes; {os.path.basename(woff2)} {os.path.getsize(woff2)} bytes; fallback on: {', '.join(fallbacks) or 'none'}")
    f.close()


def build_sans(outdir, weight_name):
    weight, nib = {"Light": (300, 26), "Regular": (400, 38)}[weight_name]
    family = "Lorenzo Meadow Sans"
    f = fontkit.new_font(family, weight_name, weight, ascent=780, descent=220, xheight=SANS_METRICS.X, capheight=SANS_METRICS.C, copyright=COPYRIGHT,
                         descriptor="A wide, light geometric sans drawn by hand: every letter a little off true, the way a ruled line is.")
    rnd = random.Random(7)
    fallbacks = []
    for name in skeleton.SK:
        g = skeleton.draw(name, SANS_METRICS)
        x0 = SANS_SIDE + nib / 2
        tilt = math.radians(rnd.uniform(-1.1, 1.1))
        lift = rnd.uniform(-4, 4)
        cx = g["width"] / 2

        def place(p, x0=x0, tilt=tilt, lift=lift, cx=cx):
            x, y = p[0] - cx, p[1]
            return (x0 + cx + x * math.cos(tilt) - y * math.sin(tilt) * 0.35, lift + y + x * math.sin(tilt))
        uni = g["uni"]
        glyph = f.createChar(uni, name) if uni is not None else f.createChar(-1, name)
        glyph.foreground = fontkit.layer_from_segments([cubics(s) for s in g["strokes"]], place)
        if fontkit.expand(glyph, nib):
            fallbacks.append(name)
        fontkit.roughen(glyph, 0.4, seed=sum(map(ord, name)) + weight, wobble=(1.6, 1.0, 0.6), jitter=0.9, notch=0.0)
        glyph.width = int(g["width"] + 2 * SANS_SIDE + nib)
    fontkit.add_spaces(f, 330, thin=130)
    for uni, base_name, mark_name in fontkit.COMPOSITES:
        fontkit.compose(f, uni, base_name, mark_name, slant=0.0, cap_lift=SANS_METRICS.C - SANS_METRICS.X)
    kern(f)
    ttf, woff2 = fontkit.write(f, outdir, f"LorenzoMeadowSans-{weight_name}")
    print(f"{family} {weight_name} -> {os.path.basename(ttf)} {os.path.getsize(ttf)} bytes; {os.path.basename(woff2)} {os.path.getsize(woff2)} bytes; fallback on: {', '.join(fallbacks) or 'none'}")
    f.close()


def kern(f):
    """A few pairs a wide sans cannot do without."""
    pairs = {("A", "V"): -70, ("A", "W"): -55, ("A", "Y"): -70, ("A", "T"): -60, ("V", "A"): -70, ("W", "A"): -55, ("Y", "A"): -70, ("T", "A"): -60,
             ("L", "T"): -70, ("L", "V"): -70, ("L", "Y"): -70, ("L", "W"): -50, ("P", "A"): -50, ("F", "A"): -45, ("T", "o"): -40, ("T", "e"): -40,
             ("T", "a"): -40, ("T", "period"): -60, ("T", "comma"): -60, ("Y", "o"): -40, ("Y", "e"): -40, ("Y", "a"): -40, ("r", "period"): -40,
             ("r", "comma"): -40, ("A", "v"): -30, ("A", "y"): -30, ("v", "period"): -30, ("y", "period"): -30}
    try:
        f.addLookup("kern", "gpos_pair", (), (("kern", (("latn", ("dflt",)),)),))
        f.addLookupSubtable("kern", "kern-1")
        for (a, b), v in pairs.items():
            f[a].addPosSub("kern-1", b, 0, 0, v, 0, 0, 0, 0, 0)
    except Exception as e:  # kerning is a courtesy, never a build failure
        print("kerning skipped:", e)


def build_ornaments(outdir):
    family = "Lorenzo Meadow Ornaments"
    f = fontkit.new_font(family, "Regular", 400, ascent=780, descent=220, xheight=300, capheight=600, copyright=COPYRIGHT,
                         descriptor="Fourteen ornaments on the letters a to n: sprig, speckle, bow, dotted ring, petals, hearts, daisy, berries, branch, buds, tulip, blossoms, leaves, big bow.")
    fallbacks = []
    for letter, strokes in ORN.items():
        glyph = f.createChar(ord(letter), letter)
        merged = None
        by_nib = {}
        for nib, knots in strokes:
            by_nib.setdefault(round(nib), []).append(cubics(knots))
        for nib, segs in by_nib.items():
            tmp = f.createChar(-1, "tmp.orn")
            tmp.foreground = fontkit.layer_from_segments(segs, lambda p: p)
            if fontkit.expand(tmp, nib):
                fallbacks.append(f"{letter}@{nib}")
            layer = tmp.foreground.dup()
            merged = layer if merged is None else merged + layer
            f.removeGlyph(tmp)
        glyph.foreground = merged
        glyph.removeOverlap()
        glyph.round()
        fontkit.roughen(glyph, 0.35, seed=ord(letter), wobble=(1.5, 1.0, 0.6), jitter=0.8, notch=0.0)
        glyph.width = 680
    fontkit.add_spaces(f, 300, thin=120)
    ttf, woff2 = fontkit.write(f, outdir, "LorenzoMeadow-Ornaments")
    print(f"{family} -> {os.path.basename(ttf)} {os.path.getsize(ttf)} bytes; {os.path.basename(woff2)} {os.path.getsize(woff2)} bytes; fallback on: {', '.join(fallbacks) or 'none'}")
    f.close()


BUILDERS = {
    "Script": lambda d: build_script(d, stitched=False),
    "Stitched": lambda d: build_script(d, stitched=True),
    "Sans-Light": lambda d: build_sans(d, "Light"),
    "Sans-Regular": lambda d: build_sans(d, "Regular"),
    "Ornaments": build_ornaments,
}

if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out")
    os.makedirs(outdir, exist_ok=True)
    for style in (sys.argv[2:] or list(BUILDERS)):
        BUILDERS[style](outdir)
