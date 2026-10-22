"""
ornaments.py — the fourteen Lorenzo Meadow ornaments, on the letters a–n
(and A–N): sprig, speckle, bow, dotted ring, petals, hearts, daisy, berries,
branch, buds, tulip, blossoms, leaves, big bow.

Each stroke carries its own nib width: thin lines for stems and outlines,
fat short strokes that the nib fills into leaves and petals, concentric
rings that fill into dots. Drawn on a 600-unit square sitting on the baseline.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "longhand"))
sys.path.insert(0, os.path.dirname(HERE))
from pen import K, arc  # noqa: E402
from skeleton import line, oval  # noqa: E402

ORN = {}


def o(letter, *strokes):
    """strokes: (nib, knots) pairs."""
    ORN[letter] = [(nib, list(k)) for nib, k in strokes]


def disc(x, y, r, nib=28):
    out = []
    rr = r
    while rr > 0:
        out.append((nib, oval(x, y, rr, rr)))
        rr -= nib * 0.8
    out.append((max(nib, r * 2), [K(x, y, 0, h=0), K(x + 0.5, y, 0, h=0)]))
    return out


def petal(cx, cy, ang, r0, r1, nib):
    a = math.radians(ang)
    return (nib, [K(cx + r0 * math.cos(a), cy + r0 * math.sin(a), ang, h=0), K(cx + r1 * math.cos(a), cy + r1 * math.sin(a), ang, h=0)])


def leaf_outline(x0, y0, x1, y1, bulge=70, nib=16):
    a = math.degrees(math.atan2(y1 - y0, x1 - x0))
    return [(nib, [K(x0, y0, a + 42, hout=bulge), K(x1, y1, a - 42, hin=bulge)]),
            (nib, [K(x0, y0, a - 42, hout=bulge), K(x1, y1, a + 42, hin=bulge)]),
            (nib * 0.8, line(x0 + (x1 - x0) * 0.1, y0 + (y1 - y0) * 0.1, x0 + (x1 - x0) * 0.8, y0 + (y1 - y0) * 0.8))]


def heart(cx, cy, s):
    return disc(cx - s * 0.42, cy + s * 0.3, s * 0.3, nib=s * 0.3) + disc(cx + s * 0.42, cy + s * 0.3, s * 0.3, nib=s * 0.3) + \
        [(s * 0.7, [K(cx - s * 0.6, cy + s * 0.2, -55, h=0), K(cx, cy - s * 0.75, -55, h=0)]),
         (s * 0.7, [K(cx + s * 0.6, cy + s * 0.2, 235, h=0), K(cx, cy - s * 0.75, 235, h=0)])]


def bow(cx, cy, loop_rx, loop_ry, nib, tail):
    return [(nib, oval(cx - loop_rx - 10, cy, loop_rx, loop_ry)), (nib, oval(cx + loop_rx + 10, cy, loop_rx, loop_ry))] + disc(cx, cy, nib * 0.9, nib) + \
        [(nib * 0.85, [K(cx - 12, cy - 20, -105, hout=tail * 0.5), K(cx - tail * 0.45, cy - tail, -70, hin=tail * 0.4)]),
         (nib * 0.85, [K(cx + 12, cy - 20, -75, hout=tail * 0.5), K(cx + tail * 0.45, cy - tail, -110, hin=tail * 0.4)])]


# a — sprig: stem, two leaves, a five-petal head
o("a", (22, line(300, 10, 300, 330)), (64, [K(300, 120, 165, hout=70), K(165, 215, 150, hin=50)]), (64, [K(300, 175, 15, hout=70), K(435, 265, 30, hin=50)]),
  *disc(300, 470, 42, 34), *[petal(300, 470, 90 + i * 72, 70, 135, 74) for i in range(5)])
# b — speckle: a loose scatter of dots
o("b", *sum([disc(x, y, r, 26) for (x, y, r) in [(110, 420, 22), (210, 520, 18), (330, 470, 24), (170, 290, 16), (300, 320, 20), (430, 380, 18), (380, 220, 22), (240, 160, 16), (480, 520, 16)]], []))
# c — bow
o("c", *bow(300, 330, 115, 82, 40, 210))
# d — dotted ring
o("d", *sum([disc(300 + 175 * math.cos(math.radians(a)), 330 + 175 * math.sin(math.radians(a)), 26, 30) for a in range(0, 360, 36)], []))
# e — petals scattered round a centre
o("e", *[petal(300, 330, 20 + i * 72, 60, 160, 66) for i in range(5)], *sum([disc(300 + 215 * math.cos(math.radians(56 + i * 72)), 330 + 215 * math.sin(math.radians(56 + i * 72)), 14, 20) for i in range(5)], []))
# f — four hearts
o("f", *heart(300, 480, 120), *heart(300, 180, 120), *heart(150, 330, 120), *heart(450, 330, 120))
# g — daisy on a stem with two leaves
o("g", (22, line(300, 10, 300, 300)), (58, [K(300, 90, 160, hout=60), K(185, 165, 150, hin=45)]), (58, [K(300, 150, 20, hout=60), K(415, 225, 30, hin=45)]),
  *disc(300, 430, 38, 30), *[petal(300, 430, 90 + i * 51.4, 62, 150, 62) for i in range(7)])
# h — a sprig with berries
o("h", (22, [K(130, 20, 62, hout=220), K(470, 590, 68, hin=220)]), (56, [K(230, 190, 150, hout=50), K(120, 260, 140, hin=40)]), (56, [K(330, 350, 10, hout=50), K(460, 400, 20, hin=40)]),
  (56, [K(300, 300, 160, hout=50), K(185, 380, 150, hin=40)]), *disc(395, 470, 28, 30), *disc(470, 530, 26, 30), *disc(340, 560, 24, 30))
# i — a leafy branch
o("i", (22, [K(40, 110, 32, hout=260), K(570, 500, 32, hin=260)]),
  *[(54, [K(x, y, a, h=0), K(x + 100 * math.cos(math.radians(a)), y + 100 * math.sin(math.radians(a)), a, h=0)]) for (x, y, a) in [(140, 180, 95), (220, 240, -25), (300, 300, 95), (380, 360, -25), (460, 420, 95)]])
# j — a stem with buds
o("j", (20, line(300, 20, 300, 560)), (20, [K(300, 330, 150, hout=60), K(175, 425, 120, hin=50)]), (20, [K(300, 250, 30, hout=60), K(425, 345, 60, hin=50)]),
  *disc(170, 445, 34, 32), *disc(430, 365, 34, 32), *disc(300, 585, 38, 32))
# k — tulip
o("k", (22, line(300, 10, 300, 330)), (60, [K(300, 100, 160, hout=70), K(170, 190, 150, hin=50)]), (60, [K(300, 160, 20, hout=70), K(430, 250, 30, hin=50)]),
  (92, [K(300, 340, 90, h=0), K(300, 530, 90, h=0)]), (92, [K(300, 340, 118, hout=80), K(205, 520, 100, hin=60)]), (92, [K(300, 340, 62, hout=80), K(395, 520, 80, hin=60)]))
# l — three blossoms, outlined
o("l", *sum([[(16, oval(cx + 50 * math.cos(math.radians(a)), cy + 50 * math.sin(math.radians(a)), 31, 31)) for a in range(90, 450, 72)] + disc(cx, cy, 12, 16) for (cx, cy) in [(150, 420), (330, 250), (470, 470)]], []))
# m — four leaves, outlined
o("m", *leaf_outline(80, 440, 260, 560), *leaf_outline(330, 560, 520, 450), *leaf_outline(100, 200, 290, 80), *leaf_outline(330, 100, 540, 230))
# n — a big bow with ribbon tails
o("n", *bow(300, 380, 150, 110, 46, 330))

for letter in list(ORN):
    ORN[letter.upper()] = ORN[letter]
