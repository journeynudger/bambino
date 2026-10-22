"""
script_glyphs.py — the lowercase of Lorenzo Meadow Script, written as pen
strokes (see tools/longhand/pen.py for the knot language).

A print-script: round, open, unjoined, every letter standing on its own with
a small lead-in tick where the pen lands and a lift where it leaves. Tall,
airy ascenders (760 on an x-height of 300) and long descenders. Capitals,
figures, punctuation and accents are the Longhand drawings, written with
the thinner nib and a gentler slant — the same hand, printing instead of
running on.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "longhand"))
sys.path.insert(0, os.path.dirname(HERE))
from pen import K, arc, dot  # noqa: E402
from skeleton import ess, line  # noqa: E402
import glyphs as longhand  # noqa: E402

X = 300
ASC = 760
DESC = -300
SLANT = 0.18

SCRIPT = {}


def g(name, adv, *strokes, uni=None):
    SCRIPT[name] = {"adv": adv, "strokes": [list(s) for s in strokes], "uni": uni if uni is not None else (ord(name) if len(name) == 1 else None)}


def oval(cx, cy, rx, ry, start=60):
    return arc(cx, cy, rx, ry, start, start + 360)


def tick_in(x, y=X):
    """The lead-in: a short rising stroke landing at the top of a stem."""
    return [K(x - 50, y - 115, 62, hout=55), K(x, y, 96, hin=28, hout=0)]


def exit_hook(x, y=0):
    return [K(x, y, -86, hin=0, hout=30), K(x + 58, y + 64, 52, hin=36)]


def stem(x, top, bottom, lift=True):
    k = [K(x, top, -90, h=0)]
    if lift:
        return k + exit_hook(x + 2, bottom)
    return k + [K(x + 2, bottom, -88, hin=0)]


g("a", 330, oval(125, 150, 115, 150), [K(240, 300, -90, h=0)] + exit_hook(244))
g("b", 320, [K(30, ASC, -90, h=0), K(28, 0, -90, hin=0)], oval(140, 150, 112, 150))
g("c", 270, arc(135, 150, 118, 150, 40, 318))
g("d", 340, oval(125, 150, 115, 150), [K(242, ASC, -90, h=0)] + exit_hook(246))
g("e", 270, line(14, 150, 250, 150), arc(132, 150, 118, 150, 0, 322))
g("f", 300, [K(88, -150, 92, h=0), K(100, 640, 90, h=0)] + arc(190, 640, 90, 110, 180, 90)[1:], line(10, X, 200, X))
g("g", 330, oval(125, 150, 115, 150), [K(242, 300, -90, h=0), K(246, -150, -90, hin=0)] + arc(126, -150, 120, 150, 0, -180)[1:])
g("h", 330, [K(30, ASC, -90, h=0), K(28, 0, -90, hin=0)], [K(28, 160, 90, h=0)] + arc(148, 160, 120, 140, 180, 0) + exit_hook(268))
g("i", 190, tick_in(90) + exit_hook(94), dot(96, 450, 8))
g("dotlessi", 190, tick_in(90) + exit_hook(94), uni=0x131)
g("j", 300, tick_in(240) + [K(243, -150, -90, hin=0)] + arc(123, -150, 120, 150, 0, -180)[1:], dot(246, 450, 8))
g("k", 320, [K(30, ASC, -90, h=0), K(28, 0, -90, hin=0)], line(28, 120, 232, 300), line(102, 185, 252, 0))
g("l", 190, [K(60, ASC, -90, h=0)] + exit_hook(62))
g("m", 520, [K(30, 300, -90, h=0), K(28, 0, -90, hin=0)], [K(28, 160, 90, h=0)] + arc(133, 160, 105, 140, 180, 0) + [K(238, 0, -90, hin=0)],
  [K(238, 160, 90, h=0)] + arc(343, 160, 105, 140, 180, 0) + exit_hook(448))
g("n", 330, [K(30, 300, -90, h=0), K(28, 0, -90, hin=0)], [K(28, 160, 90, h=0)] + arc(148, 160, 120, 140, 180, 0) + exit_hook(268))
g("o", 300, oval(140, 150, 118, 150))
g("p", 320, [K(30, 300, -90, h=0), K(28, DESC, -90, hin=0)], oval(142, 150, 112, 150))
g("q", 330, oval(125, 150, 115, 150), [K(242, 300, -90, h=0)] + exit_hook(246, DESC))
g("r", 260, tick_in(90) + [K(92, 0, -88, hin=0)], [K(92, 180, 80, hout=70), K(180, 296, 10, hin=60, hout=50), K(258, 250, -40, hin=40)])
g("s", 260, ess(130, -4, 304, 112, 120))
g("t", 260, [K(100, 620, -90, h=0), K(102, 80, -90, hin=0, hout=None)] + arc(180, 80, 78, 80, 180, 360)[1:], line(10, X, 190, X))
g("u", 340, tick_in(90) + [K(90, 100, -90, hin=0, hout=None)] + arc(185, 100, 95, 100, 180, 360)[1:] + [K(280, 300, 90, hin=0)],
  [K(280, 300, -90, h=0)] + exit_hook(284))
g("v", 320, line(20, 300, 150, 0), line(150, 0, 290, 300))
g("w", 480, line(20, 300, 130, 0), line(130, 0, 240, 250), line(240, 250, 350, 0), line(350, 0, 460, 300))
g("x", 300, line(20, 300, 280, 0), line(280, 300, 20, 0))
g("y", 320, line(20, 300, 160, 0), line(300, 300, 60, DESC))
g("z", 300, line(20, 300, 280, 300), line(280, 300, 20, 0), line(20, 0, 280, 0))

# Everything else is the Longhand hand: capitals, figures, punctuation, marks.
for name, gd in longhand.GLYPHS.items():
    if name not in SCRIPT and not (len(name) == 1 and name.islower()):
        SCRIPT[name] = {"adv": gd["adv"], "strokes": gd["strokes"], "uni": gd["uni"]}
