"""
ttbuild.py — turn pen strokes into font files, with no fontforge.

The families describe their letters as open centrelines (see
tools/fonts/longhand/pen.py). This module strokes them with a round nib,
takes the overlaps out, and writes TrueType + WOFF2:

  path_from_strokes()  a Skia path from a glyph's knots, slanted into font space
  expand()             stroke the centreline and union the result
  jitter()             push the outline about so an edge reads as pencil
  compose()            an accented letter: base plus mark, mark centred upright
  build()              assemble and write <basename>.ttf and .woff2

Needs: skia-pathops, fonttools, brotli (`pip install skia-pathops fonttools brotli`).
"""
import math
import os

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

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
WEIGHT_NAMES = {100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold"}


def path_from_strokes(stroke_segments, transform):
    """One open Skia path per stroke, from lists of cubic segments
    (p0, c1, c2, p1); `transform` maps a design point into font space."""
    paths = []
    for segs in stroke_segments:
        if not segs:
            continue
        path = pathops.Path()
        x, y = transform(segs[0][0])
        path.moveTo(x, y)
        for (_p0, c1, c2, p1) in segs:
            path.cubicTo(*transform(c1), *transform(c2), *transform(p1))
        paths.append(path)
    return paths


def _without_slivers(path, min_area=40.0):
    """Drop the near-zero contours a union can leave where two outlines
    touch; they only confuse the rasteriser."""
    rec = RecordingPen()
    path.draw(rec)
    out = pathops.Path()
    pen = out.getPen()
    contour, pts = [], []
    for op, args in rec.value:
        contour.append((op, args))
        if op in ("moveTo", "lineTo"):
            pts.append(args[0])
        elif op in ("qCurveTo", "curveTo"):
            pts.extend(a for a in args if a is not None)
        if op in ("closePath", "endPath"):
            area = abs(sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1])) / 2)
            if area >= min_area:
                for o, a in contour:
                    getattr(pen, o)(*a)
            contour, pts = [], []
    return out


def expand(paths, width):
    """Stroke each centreline with a round nib, clean it, and union the
    strokes one by one. (Stroking every stroke into one path and simplifying
    the lot once is what Skia's pathops chokes on where a hand's strokes
    cross and retrace; a pairwise union never did.)"""
    result = None
    for path in paths:
        piece = pathops.Path(path)
        piece.stroke(float(width), pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4.0)
        piece.convertConicsToQuads()
        piece.simplify()
        result = piece if result is None else pathops.op(result, piece, pathops.PathOp.UNION)
    return _without_slivers(result if result is not None else pathops.Path())


def jitter(path, amount, seed, wobble=(2.6, 1.6, 1.0)):
    """Pencil on paper: every point of the outline is pushed a little along
    a slow sine field, so the edge wavers like graphite catching the tooth.
    Deterministic for a seed; `amount` scales the push (1.0 ≈ 3 units)."""
    if amount <= 0:
        return path
    rec = RecordingPen()
    path.draw(rec)
    phase = (seed * 0.618) % 6.283
    a, b, c = wobble

    def push(pt):
        x, y = pt
        dx = amount * (a * math.sin(0.021 * y + phase) + b * math.sin(0.047 * x + 2 * phase) + c * math.sin(0.11 * (x + y)))
        dy = amount * (a * math.cos(0.019 * x - phase) + b * math.sin(0.043 * y + phase) + c * math.cos(0.09 * (x - y)))
        return (x + dx, y + dy)

    out = pathops.Path()
    pen = out.getPen()
    for op, args in rec.value:
        if op in ("moveTo", "lineTo"):
            getattr(pen, op)(push(args[0]))
        elif op == "qCurveTo":
            pen.qCurveTo(*[push(p) for p in args])
        elif op == "curveTo":
            pen.curveTo(*[push(p) for p in args])
        elif op == "closePath":
            pen.closePath()
        elif op == "endPath":
            pen.endPath()
    out.simplify()
    return out


def upright_centre(path, slant):
    """The centre of a path's box, measured before the slant pulled it over."""
    xmin, ymin, xmax, ymax = path.bounds
    cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
    return cx - slant * cy


def compose(base, mark, base_name, mark_name, slant, cap_lift):
    """An accented letter: the base plus the mark, centred over it upright
    and lifted for capitals; the cedilla hangs where it is drawn."""
    dy = 0 if mark_name == "cedilla" else (cap_lift if base_name in CAP_NAMES else 0)
    dx = (upright_centre(base, slant) - upright_centre(mark, slant)) + slant * dy
    moved = pathops.Path(mark)
    moved.transform(1, 0, 0, 1, dx, dy)
    out = pathops.Path(base)
    out.addPath(moved)
    out.simplify()
    return out


def tt_glyph(path):
    pen = TTGlyphPen(None)
    path.draw(pen)
    return pen.glyph()


def build(*, family, style, weight, glyphs, outdir, basename, ascent, descent, xheight, capheight,
          italic_angle=0.0, copyright="", descriptor="", version="1.000", space=260, thin_space=None, monospace=False):
    """Write <basename>.ttf and .woff2. `glyphs` maps glyph name → (path, advance, codepoint-or-None)."""
    os.makedirs(outdir, exist_ok=True)
    order = [".notdef", "space", "nbspace", "thinspace"] + [n for n in glyphs if n not in (".notdef", "space")]
    glyf, metrics, cmap = {}, {}, {}
    empty = TTGlyphPen(None).glyph()
    glyf[".notdef"] = empty
    metrics[".notdef"] = (500, 0)
    for name, cp, adv in (("space", 0x20, space), ("nbspace", 0xA0, space), ("thinspace", 0x2009, thin_space or max(60, space // 2))):
        glyf[name] = TTGlyphPen(None).glyph()
        metrics[name] = (adv, 0)
        cmap[cp] = name
    for name, (path, adv, uni) in glyphs.items():
        g = tt_glyph(path)
        g.recalcBounds(None) if hasattr(g, "recalcBounds") else None
        glyf[name] = g
        xmin = path.bounds[0] if path.bounds else 0
        metrics[name] = (int(round(adv)), int(math.floor(xmin)))
        if uni is not None:
            cmap[uni] = name

    ps_family = family.replace(" ", "")
    ps_name = f"{ps_family}-{style.replace(' ', '')}"
    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyf)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ascent, descent=-descent, lineGap=200)
    fb.setupNameTable({
        "familyName": family,
        "styleName": style,
        "uniqueFontIdentifier": f"{family} {style} {version}",
        "fullName": f"{family} {style}",
        "psName": ps_name,
        "version": f"Version {version}",
        "copyright": copyright,
        "designer": "Lorenzo Scardicchio",
        "description": descriptor,
        "typographicFamily": family,
        "typographicSubfamily": style,
    })
    fb.setupOS2(
        version=4, usWeightClass=weight, usWidthClass=5, fsType=0,
        sTypoAscender=ascent, sTypoDescender=-descent, sTypoLineGap=200,
        usWinAscent=ascent + 200, usWinDescent=descent + 80,
        sxHeight=xheight, sCapHeight=capheight, achVendID="LRNZ",
        fsSelection=(1 << 7) | ((1 << 0) if italic_angle else 0) | ((1 << 5) if weight >= 600 else 0) | ((1 << 6) if weight < 600 and not italic_angle else 0),
        panose=dict(bFamilyType=3 if italic_angle else 2, bSerifStyle=0, bWeight=0, bProportion=9 if monospace else 0, bContrast=0, bStrokeVariation=0, bArmStyle=0, bLetterForm=0, bMidline=0, bXHeight=0),
    )
    fb.setupPost(italicAngle=float(italic_angle), isFixedPitch=1 if monospace else 0)
    fb.setupDummyDSIG() if hasattr(fb, "setupDummyDSIG") else None
    ttf = os.path.join(outdir, f"{basename}.ttf")
    fb.save(ttf)
    woff2 = os.path.join(outdir, f"{basename}.woff2")
    t = TTFont(ttf)
    t.flavor = "woff2"
    t.save(woff2)
    return ttf, woff2
