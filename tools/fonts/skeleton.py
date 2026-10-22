"""
skeleton.py — the bones of a drawn roman: every letter as centrelines on a
box, parametrised by the family's metrics, so one drawing serves both the
typewriter (monospaced, slab-serifed, upright) and the meadow sans (wide,
light, proportional).

Each glyph is a function of the metrics `m` returning a dict:
  strokes  open centrelines in pen.py's knot language (upright, unslanted)
  slabs    (x, y, half) horizontal serifs the serif style adds at stem ends
  vserifs  (x, y, dir) short vertical serifs at arm ends (dir +1 up, -1 down)
  width    natural width of the drawing (set by normalise(); 0 for a bare stem)

Metrics: C cap height, X x-height, A ascender, D descender (negative),
geometric (single-storey a and g, for the sans), dot (radius of the i-dot).
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "longhand"))
from pen import K, arc, cubics  # noqa: E402


class Metrics:
    def __init__(self, C=600, X=430, A=640, D=-200, geometric=False, dot=12, xscale=1.0):
        self.C, self.X, self.A, self.D, self.geometric, self.dot, self.xscale = C, X, A, D, geometric, dot, xscale


def line(x0, y0, x1, y1):
    a = math.degrees(math.atan2(y1 - y0, x1 - x0))
    return [K(x0, y0, a, h=0), K(x1, y1, a, h=0)]


def poly(*pts):
    """A chain of straight runs through the points, as one stroke per run so
    the corners stay sharp."""
    return [line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) for i in range(len(pts) - 1)]


def oval(cx, cy, rx, ry, start=90):
    k = arc(cx, cy, rx, ry, start, start + 360)
    return k


def ring(x, y, r):
    """A filled dot: rings the nib fills in."""
    rings = []
    rr = r
    while rr > 0:
        rings.append(oval(x, y, rr, rr))
        rr -= 18
    return rings


def dee(x0, ybot, ytop, xr, bulge=0.38):
    """A D-shaped bowl: along the top from the stem, half an ellipse down the
    right, back along the bottom to the stem."""
    cx = x0 + (xr - x0) * bulge
    ry = (ytop - ybot) / 2
    return [K(x0, ytop, 0, h=0)] + arc(cx, ybot + ry, xr - cx, ry, 90, -90) + [K(x0, ybot, 180, h=0)]


def arch(x0, x1, ybase, ytop, down_to=0, start=0.55):
    """n / h / m shoulder: up the left stem from `start` of the height, over
    the top, down the right to `down_to`."""
    ys = ybase + (ytop - ybase) * start
    rx = (x1 - x0) / 2
    ry = ytop - ys
    return [K(x0, ys, 90, h=0)] + arc(x0 + rx, ys, rx, ry, 180, 0) + [K(x1, down_to, -90, h=0)]


def ess(cx, ybot, ytop, rx_top, rx_bot, a_top=35, a_bot=-145):
    mid = (ytop + ybot) / 2
    ry_top = (ytop - mid) / 2 * 0.98
    ry_bot = (mid - ybot) / 2 * 1.02
    top = arc(cx, mid + ry_top, rx_top, ry_top, a_top, 270)
    bot = arc(cx, mid - ry_bot, rx_bot, ry_bot, 90, a_bot)
    return top + bot[1:]


def mirror(strokes, w):
    out = []
    for s in strokes:
        ms = []
        for k in s:
            x, y = k["p"]
            ms.append({"p": (w - x, y), "a": 180 - k["a"], "hin": k["hin"], "hout": k["hout"]})
        out.append(ms)
    return out


def bbox(strokes):
    xs, ys = [], []
    for s in strokes:
        for (p0, c1, c2, p1) in cubics(s):
            for u in (0, .25, .5, .75, 1):
                mt = 1 - u
                xs.append(mt ** 3 * p0[0] + 3 * mt * mt * u * c1[0] + 3 * mt * u * u * c2[0] + u ** 3 * p1[0])
                ys.append(mt ** 3 * p0[1] + 3 * mt * mt * u * c1[1] + 3 * mt * u * u * c2[1] + u ** 3 * p1[1])
    if not xs:
        return 0, 0, 0, 0
    return min(xs), min(ys), max(xs), max(ys)


def normalise(g):
    """Shift the drawing so its leftmost centreline point sits at x = 0 and
    record its width. Slabs and serifs move with it."""
    x0, _, x1, _ = bbox(g["strokes"])
    dx = -x0
    for s in g["strokes"]:
        for k in s:
            k["p"] = (k["p"][0] + dx, k["p"][1])
    g["slabs"] = [(x + dx, y, h) for (x, y, h) in g.get("slabs", [])]
    g["vserifs"] = [(x + dx, y, d) for (x, y, d) in g.get("vserifs", [])]
    g["width"] = x1 - x0
    return g


def G(strokes, slabs=(), vserifs=()):
    return {"strokes": [list(s) for s in strokes], "slabs": list(slabs), "vserifs": list(vserifs)}


SK = {}


def glyph(name, uni=None):
    def deco(fn):
        SK[name] = (fn, uni if uni is not None else (ord(name) if len(name) == 1 else None))
        return fn
    return deco


# ─── capitals ─────────────────────────────────────────────────────────────────

@glyph("A")
def _A(m):
    C = m.C
    return G([line(0, 0, 260, C), line(260, C, 520, 0), line(95, 0.33 * C, 425, 0.33 * C)], slabs=[(0, 0, 80), (520, 0, 80)])


@glyph("B")
def _B(m):
    C = m.C
    return G([line(0, 0, 0, C), dee(0, 0.5 * C, C, 420), dee(0, 0, 0.5 * C, 460)], slabs=[(0, 0, 80), (0, C, 80)])


@glyph("C")
def _C(m):
    C = m.C
    return G([arc(260, C / 2, 260, C / 2 + 8, 48, 312)], vserifs=[(432, 0.87 * C, -1)])


@glyph("D")
def _D(m):
    C = m.C
    return G([line(0, 0, 0, C), dee(0, 0, C, 490, bulge=0.3)], slabs=[(0, 0, 80), (0, C, 80)])


@glyph("E")
def _E(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, C, 440, C), line(0, C / 2, 350, C / 2), line(0, 0, 440, 0)],
             slabs=[(0, 0, 80), (0, C, 80)], vserifs=[(440, C, -1), (440, 0, 1), (350, C / 2, -1)])


@glyph("F")
def _F(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, C, 440, C), line(0, C / 2, 340, C / 2)],
             slabs=[(0, 0, 90), (0, C, 80)], vserifs=[(440, C, -1), (340, C / 2, -1)])


@glyph("G")
def _G(m):
    C = m.C
    return G([arc(260, C / 2, 260, C / 2 + 8, 48, 360) + [K(300, C / 2, 180, h=0)]], vserifs=[(300, C / 2, -1), (432, 0.87 * C, -1)])


@glyph("H")
def _H(m):
    C = m.C
    return G([line(0, 0, 0, C), line(440, 0, 440, C), line(0, C / 2, 440, C / 2)], slabs=[(0, 0, 80), (0, C, 80), (440, 0, 80), (440, C, 80)])


@glyph("I")
def _I(m):
    C = m.C
    return G([line(0, 0, 0, C)], slabs=[(0, 0, 120), (0, C, 120)])


@glyph("J")
def _J(m):
    C = m.C
    return G([[K(360, C, -90, h=0)] + arc(220, 140, 140, 140, 0, -180)], slabs=[(360, C, 110)])


@glyph("K")
def _K(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, 0.42 * C, 400, C), line(140, 0.58 * C, 440, 0)], slabs=[(0, 0, 80), (0, C, 80), (440, 0, 80), (400, C, 80)])


@glyph("L")
def _L(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, 0, 420, 0)], slabs=[(0, C, 80)], vserifs=[(420, 0, 1)])


@glyph("M")
def _M(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, C, 280, 0.18 * C), line(280, 0.18 * C, 560, C), line(560, C, 560, 0)], slabs=[(0, 0, 80), (560, 0, 80), (0, C, 70), (560, C, 70)])


@glyph("N")
def _N(m):
    C = m.C
    return G([line(0, 0, 0, C), line(0, C, 480, 0), line(480, 0, 480, C)], slabs=[(0, 0, 80), (0, C, 70), (480, C, 80)])


@glyph("O")
def _O(m):
    C = m.C
    return G([oval(260, C / 2, 260, C / 2 + 8)])


@glyph("P")
def _P(m):
    C = m.C
    return G([line(0, 0, 0, C), dee(0, 0.46 * C, C, 440)], slabs=[(0, 0, 90), (0, C, 80)])


@glyph("Q")
def _Q(m):
    C = m.C
    return G([oval(260, C / 2, 260, C / 2 + 8), line(300, 0.22 * C, 540, -70)])


@glyph("R")
def _R(m):
    C = m.C
    return G([line(0, 0, 0, C), dee(0, 0.47 * C, C, 430), line(240, 0.47 * C, 470, 0)], slabs=[(0, 0, 80), (0, C, 80), (470, 0, 60)])


@glyph("S")
def _S(m):
    C = m.C
    return G([ess(235, -6, C + 6, 200, 215)], vserifs=[(398, 0.82 * C, -1), (60, 0.16 * C, 1)])


@glyph("T")
def _T(m):
    C = m.C
    return G([line(0, C, 480, C), line(240, C, 240, 0)], slabs=[(240, 0, 100)], vserifs=[(0, C, -1), (480, C, -1)])


@glyph("U")
def _U(m):
    C = m.C
    return G([[K(0, C, -90, h=0), K(0, 0.32 * C, -90, h=0)] + arc(230, 0.32 * C, 230, 0.32 * C + 6, 180, 360) + [K(460, C, 90, h=0)]], slabs=[(0, C, 80), (460, C, 80)])


@glyph("V")
def _V(m):
    C = m.C
    return G([line(0, C, 230, 0), line(230, 0, 460, C)], slabs=[(0, C, 70), (460, C, 70)])


@glyph("W")
def _W(m):
    C = m.C
    return G([line(0, C, 150, 0), line(150, 0, 300, 0.72 * C), line(300, 0.72 * C, 450, 0), line(450, 0, 600, C)], slabs=[(0, C, 60), (600, C, 60)])


@glyph("X")
def _X(m):
    C = m.C
    return G([line(0, 0, 470, C), line(0, C, 470, 0)], slabs=[(0, 0, 70), (470, 0, 70), (0, C, 70), (470, C, 70)])


@glyph("Y")
def _Y(m):
    C = m.C
    return G([line(0, C, 240, 0.46 * C), line(480, C, 240, 0.46 * C), line(240, 0.46 * C, 240, 0)], slabs=[(0, C, 70), (480, C, 70), (240, 0, 100)])


@glyph("Z")
def _Z(m):
    C = m.C
    return G([line(0, C, 460, C), line(460, C, 0, 0), line(0, 0, 460, 0)], vserifs=[(0, C, -1), (460, 0, 1)])


# ─── lowercase ────────────────────────────────────────────────────────────────

@glyph("a")
def _a(m):
    X = m.X
    if m.geometric:
        return G([oval(200, X / 2, 200, X / 2 + 6), line(400, X, 400, 0)])
    top = arc(205, 0.70 * X, 195, 0.30 * X, 160, 0) + [K(400, 0, -90, h=0)]
    bowl = arc(220, 0.27 * X, 182, 0.27 * X, 28, 352)
    return G([top, bowl], slabs=[(400, 0, 70)])


@glyph("b")
def _b(m):
    X, A = m.X, m.A
    return G([line(0, 0, 0, A), oval(205, X / 2, 200, X / 2 + 6)], slabs=[(0, A, 70)])


@glyph("c")
def _c(m):
    X = m.X
    return G([arc(200, X / 2, 200, X / 2 + 6, 45, 315)])


@glyph("d")
def _d(m):
    X, A = m.X, m.A
    return G([line(400, 0, 400, A), oval(195, X / 2, 200, X / 2 + 6)], slabs=[(400, A, 70), (400, 0, 70)])


@glyph("e")
def _e(m):
    X = m.X
    return G([line(2, X / 2, 398, X / 2), arc(200, X / 2, 200, X / 2 + 6, 0, 318)])


@glyph("f")
def _f(m):
    X, A = m.X, m.A
    return G([[K(120, 0, 90, h=0), K(120, A - 130, 90, h=0)] + arc(250, A - 130, 130, 130, 180, 90), line(0, X, 300, X)], slabs=[(120, 0, 110)])


@glyph("g")
def _g(m):
    X, D = m.X, m.D
    hook = [K(400, X, -90, h=0), K(400, 0.42 * D, -90, h=0)] + arc(210, 0.42 * D, 190, 0.58 * abs(D), 0, -180)
    return G([oval(195, X / 2, 200, X / 2 + 6), hook])


@glyph("h")
def _h(m):
    X, A = m.X, m.A
    return G([line(0, 0, 0, A), arch(0, 400, 0, X)], slabs=[(0, A, 70), (0, 0, 70), (400, 0, 70)])


@glyph("i")
def _i(m):
    X = m.X
    return G([line(0, 0, 0, X)] + ring(0, X + 150, m.dot), slabs=[(0, 0, 120), (0, X, 110)])


@glyph("dotlessi", 0x131)
def _dotlessi(m):
    X = m.X
    return G([line(0, 0, 0, X)], slabs=[(0, 0, 120), (0, X, 110)])


@glyph("j")
def _j(m):
    X, D = m.X, m.D
    return G([[K(0, X, -90, h=0), K(0, 0.45 * D, -90, h=0)] + arc(-140, 0.45 * D, 140, 0.55 * abs(D), 0, -180)] + ring(0, X + 150, m.dot), slabs=[(0, X, 110)])


@glyph("k")
def _k(m):
    X, A = m.X, m.A
    return G([line(0, 0, 0, A), line(0, 0.38 * X, 340, X), line(120, 0.52 * X, 390, 0)], slabs=[(0, A, 70), (0, 0, 70), (390, 0, 60), (340, X, 60)])


@glyph("l")
def _l(m):
    """Never a bare stem — a flag at the top and a foot curving right keep it
    apart from the capital I in a column of type."""
    A = m.A
    return G([line(-95, A, 0, A), [K(0, A, -90, h=0), K(0, 110, -90, h=0)] + arc(110, 110, 110, 110, 180, 360)])


@glyph("m")
def _m(m):
    X = m.X
    return G([line(0, 0, 0, X), arch(0, 300, 0, X), arch(300, 600, 0, X)], slabs=[(0, 0, 60), (300, 0, 60), (600, 0, 60), (0, X, 60)])


@glyph("n")
def _n(m):
    X = m.X
    return G([line(0, 0, 0, X), arch(0, 400, 0, X)], slabs=[(0, 0, 70), (400, 0, 70), (0, X, 60)])


@glyph("o")
def _o(m):
    X = m.X
    return G([oval(200, X / 2, 200, X / 2 + 6)])


@glyph("p")
def _p(m):
    X, D = m.X, m.D
    return G([line(0, D, 0, X), oval(205, X / 2, 200, X / 2 + 6)], slabs=[(0, D, 80), (0, X, 60)])


@glyph("q")
def _q(m):
    X, D = m.X, m.D
    return G([line(400, D, 400, X), oval(195, X / 2, 200, X / 2 + 6)], slabs=[(400, D, 80)])


@glyph("r")
def _r(m):
    X = m.X
    return G([line(0, 0, 0, X), [K(0, 0.55 * X, 90, h=0)] + arc(160, 0.55 * X, 160, 0.45 * X, 180, 22)], slabs=[(0, 0, 110), (0, X, 60)])


@glyph("s")
def _s(m):
    X = m.X
    return G([ess(180, -5, X + 5, 160, 172)])


@glyph("t")
def _t(m):
    X, A = m.X, m.A
    top = X + (A - X) * 0.6
    return G([[K(120, top, -90, h=0), K(120, 110, -90, h=0)] + arc(230, 110, 110, 110, 180, 360), line(0, X, 300, X)])


@glyph("u")
def _u(m):
    X = m.X
    return G([[K(0, X, -90, h=0), K(0, 0.45 * X, -90, h=0)] + arc(200, 0.45 * X, 200, 0.45 * X + 5, 180, 360), line(400, X, 400, 0)], slabs=[(0, X, 60), (400, X, 60), (400, 0, 70)])


@glyph("v")
def _v(m):
    X = m.X
    return G([line(0, X, 200, 0), line(200, 0, 400, X)], slabs=[(0, X, 60), (400, X, 60)])


@glyph("w")
def _w(m):
    X = m.X
    return G([line(0, X, 140, 0), line(140, 0, 280, 0.7 * X), line(280, 0.7 * X, 420, 0), line(420, 0, 560, X)], slabs=[(0, X, 50), (560, X, 50)])


@glyph("x")
def _x(m):
    X = m.X
    return G([line(0, X, 400, 0), line(400, X, 0, 0)], slabs=[(0, X, 60), (400, X, 60), (0, 0, 60), (400, 0, 60)])


@glyph("y")
def _y(m):
    X, D = m.X, m.D
    return G([line(0, X, 208, 0), line(400, X, 90, D)], slabs=[(0, X, 60), (400, X, 60)], vserifs=[])


@glyph("z")
def _z(m):
    X = m.X
    return G([line(0, X, 380, X), line(380, X, 0, 0), line(0, 0, 380, 0)], vserifs=[(0, X, -1), (380, 0, 1)])


# ─── figures ──────────────────────────────────────────────────────────────────

@glyph("zero")
def _zero(m):
    C = m.C
    return G([oval(210, C / 2, 210, C / 2 + 8)])


@glyph("one")
def _one(m):
    C = m.C
    return G([line(0, 0.76 * C, 170, C), line(170, C, 170, 0)], slabs=[(170, 0, 150)])


@glyph("two")
def _two(m):
    C = m.C
    top = arc(215, C - 205, 205, 205, 160, -42)
    end = top[-1]["p"]
    return G([top, line(end[0], end[1], 0, 0), line(0, 0, 440, 0)], vserifs=[(440, 0, 1)])


@glyph("three")
def _three(m):
    C = m.C
    return G([arc(215, 0.74 * C, 190, 0.26 * C, 150, -90), arc(215, 0.27 * C, 215, 0.27 * C, 90, -152)], vserifs=[(50, 0.87 * C, 0), (40, 0.17 * C, 0)])


@glyph("four")
def _four(m):
    C = m.C
    return G([line(320, C, 0, 0.3 * C), line(0, 0.3 * C, 470, 0.3 * C), line(320, C, 320, 0)], slabs=[(320, 0, 90)])


@glyph("five")
def _five(m):
    C = m.C
    return G([line(380, C, 60, C), line(60, C, 52, 0.56 * C), arc(178, 0.3 * C, 215, 0.3 * C, 125, -150)], vserifs=[(380, C, -1)])


@glyph("six")
def _six(m):
    C = m.C
    return G([oval(222, 0.3 * C, 212, 0.3 * C), arc(232, 0.3 * C, 228, 0.7 * C, 180, 52)])


@glyph("seven")
def _seven(m):
    C = m.C
    return G([line(0, C, 440, C), line(440, C, 150, 0)], vserifs=[(0, C, -1)])


@glyph("eight")
def _eight(m):
    C = m.C
    return G([oval(215, 0.735 * C, 170, 0.265 * C), oval(215, 0.265 * C, 200, 0.265 * C)])


@glyph("nine")
def _nine(m):
    C = m.C
    return G([oval(218, 0.7 * C, 212, 0.3 * C), arc(208, 0.7 * C, 228, 0.7 * C, 0, -128)])


# ─── punctuation & symbols ────────────────────────────────────────────────────

@glyph("period")
def _period(m):
    return G(ring(0, 0, m.dot + 6))


@glyph("comma")
def _comma(m):
    return G(ring(0, 0, m.dot + 4) + [[K(10, -20, -105, h=20), K(-30, -150, -120, h=40)]])


@glyph("colon")
def _colon(m):
    X = m.X
    return G(ring(0, 0, m.dot + 6) + ring(0, X - 40, m.dot + 6))


@glyph("semicolon")
def _semicolon(m):
    X = m.X
    return G(ring(0, X - 40, m.dot + 6) + ring(0, 0, m.dot + 4) + [[K(10, -20, -105, h=20), K(-30, -150, -120, h=40)]])


@glyph("exclam")
def _exclam(m):
    C = m.C
    return G([line(0, C, 0, 0.26 * C)] + ring(0, 0, m.dot + 6))


@glyph("question")
def _question(m):
    C = m.C
    return G([arc(0, 0.7 * C, 165, 0.3 * C, 172, -78) + [K(10, 0.26 * C, -95, h=0)]] + ring(10, 0, m.dot + 6))


@glyph("quotesingle")
def _quotesingle(m):
    C = m.C
    return G([line(0, C, 0, C - 190)])


@glyph("quotedbl")
def _quotedbl(m):
    C = m.C
    return G([line(0, C, 0, C - 190), line(150, C, 150, C - 190)])


def _tick(x, ytop, flip=False):
    """A comma shape hanging from ytop (quoteright) or standing on it (quoteleft)."""
    if flip:
        return ring(x, ytop - 40, 22) + [[K(x - 10, ytop - 60, 105, h=20), K(x + 30, ytop + 70, 60, h=40)]]
    return ring(x, ytop, 22) + [[K(x + 10, ytop - 20, -105, h=20), K(x - 30, ytop - 150, -120, h=40)]]


@glyph("quoteleft", 0x2018)
def _quoteleft(m):
    return G(_tick(0, m.C - 150, flip=True))


@glyph("quoteright", 0x2019)
def _quoteright(m):
    return G(_tick(0, m.C - 40))


@glyph("quotedblleft", 0x201C)
def _quotedblleft(m):
    return G(_tick(0, m.C - 150, flip=True) + _tick(150, m.C - 150, flip=True))


@glyph("quotedblright", 0x201D)
def _quotedblright(m):
    return G(_tick(0, m.C - 40) + _tick(150, m.C - 40))


@glyph("hyphen")
def _hyphen(m):
    return G([line(0, 0.36 * m.C, 250, 0.36 * m.C)])


@glyph("endash", 0x2013)
def _endash(m):
    return G([line(0, 0.36 * m.C, 450, 0.36 * m.C)])


@glyph("emdash", 0x2014)
def _emdash(m):
    return G([line(0, 0.36 * m.C, 700, 0.36 * m.C)])


@glyph("parenleft")
def _parenleft(m):
    C = m.C
    return G([arc(330, 0.33 * C, 330, 0.74 * C, 118, 242)])


@glyph("parenright")
def _parenright(m):
    C = m.C
    return G([arc(0, 0.33 * C, 330, 0.74 * C, 62, -62)])


@glyph("bracketleft")
def _bracketleft(m):
    C = m.C
    return G(poly((170, C + 40), (0, C + 40), (0, -200), (170, -200)))


@glyph("bracketright")
def _bracketright(m):
    C = m.C
    return G(poly((0, C + 40), (170, C + 40), (170, -200), (0, -200)))


def _brace(m):
    C = m.C
    mid = 0.5 * C - 50
    return [[K(170, C + 40, 180, hout=60), K(80, C - 50, -90, hin=50, hout=120), K(80, mid + 40, -112, hin=60, hout=30),
             K(0, mid, 200, h=18), K(80, mid - 40, -68, hin=30, hout=60), K(80, -120, -90, hin=120, hout=50), K(170, -200, 0, hin=60)]]


@glyph("braceleft")
def _braceleft(m):
    return G(_brace(m))


@glyph("braceright")
def _braceright(m):
    return G(mirror(_brace(m), 170))


@glyph("slash")
def _slash(m):
    return G([line(0, -120, 400, m.C + 40)])


@glyph("backslash")
def _backslash(m):
    return G([line(0, m.C + 40, 400, -120)])


@glyph("bar")
def _bar(m):
    return G([line(0, -200, 0, m.C + 60)])


@glyph("ampersand")
def _ampersand(m):
    C = m.C
    return G([[K(440, 60, 150, hout=140), K(190, 0, 180, hin=70, hout=130), K(10, 150, 90, hin=90, hout=100), K(180, 0.56 * C, 45, hin=90, hout=80),
               K(300, 0.78 * C, 100, hin=60, hout=70), K(220, C, 180, hin=50, hout=50), K(125, 0.8 * C, -70, hin=50, hout=70),
               K(190, 0.5 * C, -40, hin=60, hout=120), K(450, 20, -45, hin=140)]])


@glyph("at")
def _at(m):
    C = m.C
    return G([arc(235, 0.46 * C, 235, 0.5 * C, 30, 345), oval(235, 0.47 * C, 95, 0.2 * C), line(330, 0.67 * C, 335, 0.3 * C)])


@glyph("numbersign")
def _numbersign(m):
    C = m.C
    return G([line(120, C, 60, 0), line(300, C, 240, 0), line(0, 0.65 * C, 380, 0.65 * C), line(0, 0.3 * C, 380, 0.3 * C)])


@glyph("dollar")
def _dollar(m):
    C = m.C
    return G([ess(180, 10, C - 10, 160, 172), line(180, C + 70, 180, -70)])


@glyph("percent")
def _percent(m):
    C = m.C
    return G([line(0, 0, 440, C), oval(100, 0.76 * C, 95, 0.2 * C), oval(340, 0.24 * C, 95, 0.2 * C)])


@glyph("asterisk")
def _asterisk(m):
    C = m.C
    cx, cy, r = 0, 0.74 * C, 130
    return G([line(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)), cx - r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a))) for a in (90, 30, 150)])


@glyph("plus")
def _plus(m):
    C = m.C
    return G([line(0, 0.38 * C, 320, 0.38 * C), line(160, 0.38 * C + 160, 160, 0.38 * C - 160)])


@glyph("equal")
def _equal(m):
    C = m.C
    return G([line(0, 0.46 * C + 80, 360, 0.46 * C + 80), line(0, 0.46 * C - 80, 360, 0.46 * C - 80)])


@glyph("less")
def _less(m):
    C = m.C
    return G(poly((300, 0.76 * C), (0, 0.38 * C), (300, 0)))


@glyph("greater")
def _greater(m):
    C = m.C
    return G(poly((0, 0.76 * C), (300, 0.38 * C), (0, 0)))


@glyph("underscore")
def _underscore(m):
    return G([line(0, -130, 560, -130)])


@glyph("asciitilde")
def _asciitilde(m):
    C = m.C
    return G([[K(0, 0.33 * C, 45, hout=60), K(130, 0.44 * C, 0, h=50), K(270, 0.3 * C, 0, h=50), K(400, 0.41 * C, 45, hin=60)]])


@glyph("asciicircum")
def _asciicircum(m):
    C = m.C
    return G(poly((0, 0.62 * C), (140, C), (280, 0.62 * C)))


@glyph("sterling")
def _sterling(m):
    C = m.C
    return G([[K(330, 0.74 * C, 110, hout=80), K(205, C, 180, hin=70, hout=70), K(95, 0.76 * C, -100, hin=70, hout=120), K(70, 0.12 * C, -98, hin=120, hout=30), K(30, 0, 200, hin=30)],
              line(10, 0, 400, 0), line(0, 0.4 * C, 270, 0.4 * C)])


@glyph("Euro", 0x20AC)
def _Euro(m):
    C = m.C
    return G([arc(260, C / 2, 230, C / 2 + 8, 48, 312), line(0, 0.58 * C, 300, 0.58 * C), line(0, 0.4 * C, 300, 0.4 * C)])


@glyph("degree")
def _degree(m):
    C = m.C
    return G([oval(0, C - 80, 70, 70)])


@glyph("bullet", 0x2022)
def _bullet(m):
    return G(ring(0, 0.38 * m.C, 70))


@glyph("ellipsis", 0x2026)
def _ellipsis(m):
    r = m.dot + 6
    return G(ring(0, 0, r) + ring(220, 0, r) + ring(440, 0, r))


# ─── accents (drawn for the x-height; lifted for capitals at build) ───────────

@glyph("grave")
def _grave(m):
    X = m.X
    return G([line(-60, X + 250, 10, X + 150)])


@glyph("acute")
def _acute(m):
    X = m.X
    return G([line(60, X + 250, -10, X + 150)])


@glyph("circumflex")
def _circumflex(m):
    X = m.X
    return G(poly((-90, X + 150), (0, X + 250), (90, X + 150)))


@glyph("tilde")
def _tilde(m):
    X = m.X
    y = X + 190
    return G([[K(-110, y - 25, 45, hout=45), K(-35, y + 20, 0, h=35), K(35, y - 20, 0, h=35), K(110, y + 25, 45, hin=45)]])


@glyph("dieresis")
def _dieresis(m):
    X = m.X
    return G(ring(-85, X + 180, m.dot) + ring(85, X + 180, m.dot))


@glyph("ring")
def _ring(m):
    X = m.X
    return G([oval(0, X + 205, 62, 62)])


@glyph("cedilla")
def _cedilla(m):
    return G([[K(0, 0, -90, h=0), K(0, -70, -90, hout=40), K(60, -115, -30, h=30), K(15, -175, 190, h=40), K(-50, -150, 120, h=20)]])


@glyph("caron")
def _caron(m):
    X = m.X
    return G(poly((-90, X + 250), (0, X + 150), (90, X + 250)))


def draw(name, m):
    fn, uni = SK[name]
    g = fn(m)
    if m.xscale != 1.0:
        for s in g["strokes"]:
            for k in s:
                k["p"] = (k["p"][0] * m.xscale, k["p"][1])
                a = math.radians(k["a"])
                k["a"] = math.degrees(math.atan2(math.sin(a), math.cos(a) * m.xscale))
                for key in ("hin", "hout"):
                    if k[key] is not None:
                        k[key] = k[key] * math.hypot(math.cos(a) * m.xscale, math.sin(a))
        g["slabs"] = [(x * m.xscale, y, h) for (x, y, h) in g["slabs"]]
        g["vserifs"] = [(x * m.xscale, y, d) for (x, y, d) in g["vserifs"]]
    g["uni"] = uni
    return normalise(g)
