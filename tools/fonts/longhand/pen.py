"""
pen.py — the stroke language every Lorenzo Longhand glyph is written in.

A glyph is a list of strokes. A stroke is a list of knots, each a point on
the pen's centreline with the direction the pen is travelling there (an angle
in degrees, 0 = right, 90 = up). Consecutive knots become one cubic Bézier:
the handles leave and arrive along the knot tangents, and their length is
either given (`h`, or `hin`/`hout`) or taken as a fraction of the chord. This
is how a hand actually writes — a position and a direction at each turn — so
the alphabet reads as motion, not as traced outlines.

Design space (upright; the slant is applied when the font is built):
  em 1000 · baseline 0 · x-height 320 · ascender loop 680 · cap 660 · descender -260
  JOIN = 110: every connecting lowercase letter enters at (0, JOIN) and leaves
  at (advance, JOIN), both heading up-right at JOIN_ANGLE, so any two letters
  meet with the same tangent.
"""
import math

EM = 1000
H = 320        # x-height
ASC = 760      # top of ascender loops (l, b, h, k, f)
CAP = 720      # capital height
DESC = -380    # bottom of descender loops
JOIN = 60      # where the connector crosses a glyph boundary: low, as the hand runs it
JOIN_ANGLE = 36
SLANT = 0.36   # tan(19.8°)
HANDLE = 0.37  # fallback handle length as a fraction of the chord (see cubics)


def K(x, y, ang, h=None, hin=None, hout=None):
    """A knot: the pen is at (x, y) travelling at `ang` degrees."""
    return {"p": (float(x), float(y)), "a": float(ang), "hin": hin if hin is not None else h, "hout": hout if hout is not None else h}


def E(ang=JOIN_ANGLE, h=None, hin=None, hout=None):
    """The entry knot of a connecting lowercase letter."""
    return K(0, JOIN, ang, h=h, hin=hin, hout=hout)


def X(adv, ang=JOIN_ANGLE, h=None, hin=None, hout=None):
    """The exit knot of a connecting lowercase letter."""
    return K(adv, JOIN, ang, h=h, hin=hin, hout=hout)


def arc(cx, cy, rx, ry, a0, a1, step=90.0):
    """Knots along an ellipse from angle a0 to a1 (degrees, 0 = right, 90 = top).
    Counter-clockwise when a1 > a0. Handle lengths reproduce a true arc."""
    n = max(1, int(abs(a1 - a0) / step + 0.999))
    knots = []
    theta = math.radians(abs(a1 - a0) / n)
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        x = cx + rx * math.cos(a)
        y = cy + ry * math.sin(a)
        dx, dy = -rx * math.sin(a), ry * math.cos(a)
        if a1 < a0:
            dx, dy = -dx, -dy
        ang = math.degrees(math.atan2(dy, dx))
        # local radius of curvature along the ellipse, for a faithful handle
        r = (dx * dx + dy * dy) ** 1.5 / max(1e-6, abs(rx * ry))
        h = 4 / 3 * math.tan(theta / 4) * r
        knots.append(K(x, y, ang, h=h))
    return knots


def arc_handle(a0, a1, chord):
    """The handle length that makes the cubic between two knots a true
    circular arc: the arc turns through the angle between the tangents, and
    for that turn (4/3)·tan(θ/4)·r with chord = 2·r·sin(θ/2). Straight when
    the tangents agree, a half-circle when they oppose. This is what keeps a
    bowl round and a connector even without a number on every knot."""
    theta = abs((a1 - a0 + 180) % 360 - 180)
    if theta < 1:
        return chord / 3
    t = math.radians(theta)
    return chord * (4 / 3) * math.tan(t / 4) / (2 * math.sin(t / 2))


def cubics(knots):
    """Turn a stroke's knots into (p0, c1, c2, p1) cubic segments."""
    segs = []
    for k0, k1 in zip(knots, knots[1:]):
        p0, p1 = k0["p"], k1["p"]
        chord = math.dist(p0, p1)
        auto = arc_handle(k0["a"], k1["a"], chord)
        h0 = k0["hout"] if k0["hout"] is not None else auto
        h1 = k1["hin"] if k1["hin"] is not None else auto
        a0, a1 = math.radians(k0["a"]), math.radians(k1["a"])
        c1 = (p0[0] + math.cos(a0) * h0, p0[1] + math.sin(a0) * h0)
        c2 = (p1[0] - math.cos(a1) * h1, p1[1] - math.sin(a1) * h1)
        segs.append((p0, c1, c2, p1))
    return segs


def shear(pt, k=SLANT):
    return (pt[0] + k * pt[1], pt[1])


def svg_path(strokes, k=SLANT, flip=True):
    """SVG path data for a glyph's strokes (y flipped for screen space)."""
    out = []
    for knots in strokes:
        segs = cubics(knots)
        if not segs:
            continue
        def f(p):
            x, y = shear(p, k)
            return f"{x:.1f} {(-y if flip else y):.1f}"
        out.append("M " + f(segs[0][0]) + " " + " ".join(f"C {f(c1)} {f(c2)} {f(p1)}" for (_p0, c1, c2, p1) in segs))
    return " ".join(out)


def dot(x, y, r=14):
    """A pen dot (i, j, punctuation): a tiny closed loop the stroke expands."""
    return arc(x, y, r, r, 0, 360, step=90)
