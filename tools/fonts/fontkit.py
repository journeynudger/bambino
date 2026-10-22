"""
fontkit.py — what every Lorenzo font build shares.

The families (tools/longhand, tools/typewriter, tools/meadow) each describe
their letters as pen strokes — open centrelines, see tools/longhand/pen.py —
and hand them here to be turned into font files:

  expand()   stroke the centrelines with a nib and take the overlaps out
  roughen()  push the finished outline about so the edge reads as pencil/ink
  dashify()  turn a stroke into stitches (short dashes along the centreline)
  compose()  build an accented letter from a base letter and a mark
  new_font() a font with the family's metrics and naming filled in
  write()    generate .ttf and .woff2

Run under fontforge's own Python:  fontforge -lang=py -script build.py <outdir>
"""
import math
import os
import random

import fontforge

# Accented letters, composed from a base letter and a mark:
# (codepoint, base glyph name, mark glyph name). The i-forms use dotlessi.
COMPOSITES = [
    (0xC0, "A", "grave"), (0xC1, "A", "acute"), (0xC2, "A", "circumflex"), (0xC3, "A", "tilde"), (0xC4, "A", "dieresis"), (0xC5, "A", "ring"),
    (0xC7, "C", "cedilla"), (0xC8, "E", "grave"), (0xC9, "E", "acute"), (0xCA, "E", "circumflex"), (0xCB, "E", "dieresis"),
    (0xCC, "I", "grave"), (0xCD, "I", "acute"), (0xCE, "I", "circumflex"), (0xCF, "I", "dieresis"), (0xD1, "N", "tilde"),
    (0xD2, "O", "grave"), (0xD3, "O", "acute"), (0xD4, "O", "circumflex"), (0xD5, "O", "tilde"), (0xD6, "O", "dieresis"),
    (0xD9, "U", "grave"), (0xDA, "U", "acute"), (0xDB, "U", "circumflex"), (0xDC, "U", "dieresis"), (0xDD, "Y", "acute"),
    (0xE0, "a", "grave"), (0xE1, "a", "acute"), (0xE2, "a", "circumflex"), (0xE3, "a", "tilde"), (0xE4, "a", "dieresis"), (0xE5, "a", "ring"),
    (0xE7, "c", "cedilla"), (0xE8, "e", "grave"), (0xE9, "e", "acute"), (0xEA, "e", "circumflex"), (0xEB, "e", "dieresis"),
    (0xEC, "dotlessi", "grave"), (0xED, "dotlessi", "acute"), (0xEE, "dotlessi", "circumflex"), (0xEF, "dotlessi", "dieresis"), (0xF1, "n", "tilde"),
    (0xF2, "o", "grave"), (0xF3, "o", "acute"), (0xF4, "o", "circumflex"), (0xF5, "o", "tilde"), (0xF6, "o", "dieresis"),
    (0xF9, "u", "grave"), (0xFA, "u", "acute"), (0xFB, "u", "circumflex"), (0xFC, "u", "dieresis"), (0xFD, "y", "acute"), (0xFF, "y", "dieresis"),
    (0x160, "S", "caron"), (0x161, "s", "caron"), (0x178, "Y", "dieresis"), (0x17D, "Z", "caron"), (0x17E, "z", "caron"),
]
CAP_NAMES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")


# ─── geometry ─────────────────────────────────────────────────────────────────

def cubic_point(p0, c1, c2, p1, u):
    mt = 1 - u
    return (mt ** 3 * p0[0] + 3 * mt * mt * u * c1[0] + 3 * mt * u * u * c2[0] + u ** 3 * p1[0],
            mt ** 3 * p0[1] + 3 * mt * mt * u * c1[1] + 3 * mt * u * u * c2[1] + u ** 3 * p1[1])


def polyline(segs, step=6.0):
    """Points along a run of cubic segments, roughly `step` apart."""
    pts = []
    for (p0, c1, c2, p1) in segs:
        approx = math.dist(p0, c1) + math.dist(c1, c2) + math.dist(c2, p1)
        k = max(2, int(approx / step))
        for s in range(k):
            pts.append(cubic_point(p0, c1, c2, p1, s / k))
    if segs:
        pts.append(segs[-1][3])
    return pts


def layer_from_segments(stroke_segments, transform):
    """Open fontforge contours from lists of cubic segments; `transform` maps
    a design point to font space (the slant goes here)."""
    layer = fontforge.layer()
    for segs in stroke_segments:
        segs = [s for s in segs if math.dist(s[0], s[3]) > 0.01]
        if not segs:
            continue
        c = fontforge.contour()
        x, y = transform(segs[0][0])
        c.moveTo(x, y)
        for (_p0, c1, c2, p1) in segs:
            c.cubicTo(transform(c1), transform(c2), transform(p1))
        c.closed = False
        layer += c
    return layer


def dashify(segs, dash=30.0, gap=22.0, phase=0.0):
    """Stitches: cut a stroke's centreline into short straight dashes. Each
    dash comes back as its own cubic segment list, so it strokes like a pen
    stroke. The thread lifts and lands with the needle, so the dash length is
    kept and only the gaps absorb the remainder."""
    pts = polyline(segs, step=3.0)
    out = []
    dist = -phase
    cur = []
    on = True
    for i in range(1, len(pts)):
        a, b = pts[i - 1], pts[i]
        d = math.dist(a, b)
        dist += d
        if on:
            cur.append(a)
            if dist >= dash:
                cur.append(b)
                out.append([(cur[j], cur[j], cur[j + 1], cur[j + 1]) for j in range(len(cur) - 1)])
                cur = []
                on = False
                dist = 0.0
        else:
            if dist >= gap:
                on = True
                dist = 0.0
    if on and len(cur) > 1:
        out.append([(cur[j], cur[j], cur[j + 1], cur[j + 1]) for j in range(len(cur) - 1)])
    return out


# ─── expanding the pen ────────────────────────────────────────────────────────

def _stroked(layer, width, cap, join):
    res = layer.stroke("circular", width, cap, join)
    return res if res is not None else layer


def expand(glyph, width, cap="round", join="round"):
    """Stroke the open centrelines into outlines and remove the overlaps.

    FontForge's overlap removal occasionally fails on a self-crossing stroke
    (B's bowls, the figure 2, a bracket) and fills the whole letter in. When
    the result still intersects itself, each stroke is expanded on its own,
    tidied, and only then merged; if even the merge misbehaves, a light
    simplify settles it. Returns the number of fallbacks taken, for the log."""
    source = glyph.foreground.dup()
    glyph.stroke("circular", width, cap, join)
    glyph.removeOverlap()
    glyph.round()
    if not glyph.selfIntersects():
        return 0
    merged = fontforge.layer()
    for contour in source:
        single = fontforge.layer()
        single += contour
        single = _stroked(single, width, cap, join)
        single.removeOverlap()
        single.round()
        merged += single
    merged.removeOverlap()
    merged.round()
    if merged.selfIntersects():
        merged.simplify(0.5)
        merged.removeOverlap()
        merged.round()
        glyph.foreground = merged
        return 2 if merged.selfIntersects() else 1
    glyph.foreground = merged
    return 1


# ─── pencil grit ──────────────────────────────────────────────────────────────

def sample_contour(contour, step=9.0):
    """Points along a closed cubic contour, roughly `step` units apart."""
    pts = [(p.x, p.y) for p in contour]
    flags = [p.on_curve for p in contour]
    n = len(pts)
    if n == 0:
        return []
    start = next((i for i, f in enumerate(flags) if f), 0)
    pts = pts[start:] + pts[:start]
    flags = flags[start:] + flags[:start]
    samples = []
    i = 0
    while i < n:
        p0 = pts[i]
        ctrl = []
        j = i + 1
        while j < n + 1 and not flags[j % n]:
            ctrl.append(pts[j % n])
            j += 1
        p1 = pts[j % n]
        if not ctrl:
            seg_len = math.dist(p0, p1)
            k = max(1, int(seg_len / step))
            for s in range(k):
                u = s / k
                samples.append((p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u))
        else:
            c1 = ctrl[0]
            c2 = ctrl[1] if len(ctrl) > 1 else ctrl[0]
            approx = math.dist(p0, c1) + math.dist(c1, c2) + math.dist(c2, p1)
            k = max(2, int(approx / step))
            for s in range(k):
                samples.append(cubic_point(p0, c1, c2, p1, s / k))
        i = j
    return samples


def roughen(glyph, amount, seed, step=11.0, wobble=(2.6, 1.6, 1.0), jitter=1.6, notch=0.05):
    """Grit: resample every outline into short straight runs and push each
    point along the outline normal by low-frequency wobble plus a little
    high-frequency noise. Deterministic per glyph, so rebuilds are stable."""
    rnd = random.Random(seed)
    new_layer = fontforge.layer()
    for contour in glyph.foreground:
        pts = sample_contour(contour, step=step)
        if len(pts) < 6:
            new_layer += contour
            continue
        phase = [rnd.uniform(0, 2 * math.pi) for _ in range(3)]
        n = len(pts)
        out = fontforge.contour()
        for i, (x, y) in enumerate(pts):
            px, py = pts[i - 1]
            nx_, ny_ = pts[(i + 1) % n]
            tx, ty = nx_ - px, ny_ - py
            length = math.hypot(tx, ty) or 1.0
            nxn, nyn = -ty / length, tx / length
            t = i * step
            w = (wobble[0] * math.sin(t / 47 + phase[0]) + wobble[1] * math.sin(t / 19 + phase[1]) + wobble[2] * math.sin(t / 8 + phase[2])) * amount
            j = rnd.uniform(-jitter, jitter) * amount
            k = rnd.uniform(-4.5, 1.0) * amount if rnd.random() < notch else 0.0
            d = w + j + k
            if i == 0:
                out.moveTo(x + nxn * d, y + nyn * d)
            else:
                out.lineTo(x + nxn * d, y + nyn * d)
        out.closed = True
        new_layer += out
    glyph.foreground = new_layer


# ─── accents ──────────────────────────────────────────────────────────────────

def compose(font, uni, base_name, mark_name, slant=0.0, cap_lift=0):
    """An accented letter: the base plus the mark, the mark centred over the
    base (measured upright, so the slant does not drag it sideways) and
    lifted for capitals."""
    base = font[base_name]
    mark = font[mark_name]

    def centre_x(glyph):
        xmin, ymin, xmax, ymax = glyph.boundingBox()
        cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
        return cx - slant * cy

    dy = 0 if mark_name == "cedilla" else (cap_lift if base_name in CAP_NAMES else 0)
    dx = (centre_x(base) - centre_x(mark)) + slant * dy
    g = font.createChar(uni)
    g.clear()
    g.addReference(base_name)
    g.addReference(mark_name, (1, 0, 0, 1, dx, dy))
    g.unlinkRef()
    g.removeOverlap()
    g.round()
    g.width = base.width


# ─── the font itself ──────────────────────────────────────────────────────────

WEIGHT_NAMES = {100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}


def new_font(family, style, weight, *, ascent, descent, xheight, capheight, italic_angle=0.0, copyright="", descriptor="", version="1.000", monospace=False):
    f = fontforge.font()
    f.encoding = "UnicodeFull"
    f.em = 1000
    f.ascent = ascent
    f.descent = descent
    f.familyname = family
    ps = family.replace(" ", "")
    f.fontname = f"{ps}-{style.replace(' ', '')}"
    f.fullname = f"{family} {style}"
    f.weight = WEIGHT_NAMES.get(weight, "Regular")
    f.copyright = copyright
    f.version = version
    f.italicangle = italic_angle
    f.os2_weight = weight
    f.os2_width = 5
    f.os2_fstype = 0
    f.os2_xheight = xheight
    f.os2_capheight = capheight
    f.os2_typoascent = ascent
    f.os2_typodescent = -descent
    f.os2_typolinegap = 200
    f.os2_winascent = ascent + 200
    f.os2_windescent = descent + 80
    f.hhea_ascent = ascent
    f.hhea_descent = -descent
    f.hhea_linegap = 200
    if monospace:
        f.os2_panose = (2, 9, 5, 9, 0, 0, 0, 0, 0, 0)
    f.appendSFNTName("English (US)", "Family", family)
    f.appendSFNTName("English (US)", "SubFamily", style)
    f.appendSFNTName("English (US)", "Fullname", f"{family} {style}")
    f.appendSFNTName("English (US)", "UniqueID", f"{family} {style} {version}")
    f.appendSFNTName("English (US)", "Preferred Family", family)
    f.appendSFNTName("English (US)", "Preferred Styles", style)
    f.appendSFNTName("English (US)", "Designer", "Lorenzo Scardicchio")
    if descriptor:
        f.appendSFNTName("English (US)", "Descriptor", descriptor)
    return f


def add_spaces(font, width, thin=None):
    font.createChar(0x20, "space").width = width
    font.createChar(0xA0, "nbspace").width = width
    font.createChar(0x2009, "thinspace").width = thin if thin is not None else max(60, width // 2)


def write(font, outdir, basename):
    font.selection.all()
    font.correctDirection()
    ttf = os.path.join(outdir, f"{basename}.ttf")
    font.generate(ttf, flags=("opentype", "round"))
    woff2 = os.path.join(outdir, f"{basename}.woff2")
    try:
        font.generate(woff2)
    except Exception:
        from fontTools.ttLib import TTFont
        t = TTFont(ttf)
        t.flavor = "woff2"
        t.save(woff2)
    return ttf, woff2
