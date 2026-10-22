"""
glyphs.py — every letter of Lorenzo Longhand, written as pen strokes.

Palmer-method longhand: a round monoline hand, oval bowls, looped ascenders
and descenders, every lowercase letter entering and leaving on the same
connector so words join. Capitals are the looped school-book forms, written
to stand alone (they do not join into the word).

Each entry: name → dict(adv=advance width, strokes=[knots…], join=bool).
Coordinates are upright design units (see pen.py); the slant is applied at
build time.
"""
from pen import K, E, X, arc, dot, H, ASC, CAP, DESC, JOIN

GLYPHS = {}


def g(name, adv, *strokes, join=True, uni=None):
    GLYPHS[name] = {"adv": adv, "strokes": [list(s) for s in strokes], "join": join, "uni": uni if uni is not None else ord(name) if len(name) == 1 else None}


def bowl(cx=125, cy=160, rx=105, ry=152, start=60, end=420, hout=12):
    """The counter-clockwise oval of a, d, g, q, o — closes back at the top
    right, where the pen turns down the stem with a tiny loop."""
    k = arc(cx, cy, rx, ry, start, end)
    k[-1]["hout"] = hout
    return k


def loop_up(x_stem=120, top=ASC, w=28):
    """An ascender loop climbed from the entry: up the right side, over the
    top heading left, down the left side, into the stem."""
    return [K(x_stem, 390, 80, hin=120, hout=110), K(x_stem + w, top, 178, hin=95, hout=55), K(x_stem - 22, 540, -97, hin=55, hout=120)]


def stem_down(x=120, top_h=None):
    return K(x, 0, -88, hin=150, hout=32)


def desc_loop_left(x_top=120, y_top=H, x_exit_adv=230):
    """A descender loop that swings LEFT (g, j, y, z): down, round the bottom
    heading left, up the far side, back across the stem at the baseline."""
    return [K(x_top + 4, -125, -94, hin=40, hout=110), K(x_top - 55, -258, 186, hin=60, hout=52), K(x_top - 100, -150, 82, hin=50, hout=62), K(x_top + 10, -8, 38, hin=88, hout=42)]


# ─── lowercase ────────────────────────────────────────────────────────────────
# Palmer's constructions, as the hand makes them: an undercurve rises from
# the join, the body is traced, a stem comes down and turns into the next
# undercurve. Where the pen retraces itself (the right side of an oval before
# its stem, the leg of an n before its second arch) the retrace is a second
# stroke that starts on the first; the nib unions them. Proportions are the
# wide ones of the school copybook: an oval as wide as the x-height is tall,
# loops two and a half x-heights up, joins climbing at a lazy forty degrees.
OX, OY, ORX, ORY = 170, 160, 165, 160     # the oval every round letter is built on
STEM = OX + ORX                           # a round letter's stem is tangent to its oval
DOT = 20

def oval(a0=40, extra=360, cx=OX, cy=OY, rx=ORX, ry=ORY):
    """The full oval of o: entered at the upper right by the diagonal, traced
    counter-clockwise all the way round and back (a0 .. a0 + extra)."""
    return arc(cx, cy, rx, ry, a0, a0 + extra)

TOP = (300, 262)   # where a round letter's diagonal lands and its stem begins

def diag(x1=118, y1=196):
    """The undercurve's run into a round letter: in low, then up and over
    inside the bowl's lower-left side — the hand's diagonal — to the top right
    where the bowl is traced from. It hugs the side, so a heavy nib hides it
    and a fine one shows it as a hairline, as in the copybook."""
    return [E(), K(74, 92, 50), K(x1, y1, 64)]

def bowl():
    """The bowl of a, d, g, q, as the copybook writes it: the diagonal climbs
    to the upper right, swings over the top and down the left, round the
    bottom, and up a straight right side to the stem."""
    return [*diag(), *arc(165, 160, 140, 162, 40, 270), K(238, 0, 0), K(298, 72, 88), K(TOP[0], TOP[1], 90)]

def stem(x, top, adv):
    """A straight downstroke from (x, top) to the baseline, turning into the
    exit undercurve that reaches (adv, JOIN)."""
    return [K(x, top, -90), K(x + 2, 36, -90), K(x + 42, 0, 0), X(adv)]

def loop(x=150, top=ASC):
    """An ascender loop climbed from the join: the undercurve steepens into
    the loop's right side, over the top heading left, down the far side,
    into the stem."""
    return [E(), K(x - 30, 300, 62), K(x + 46, 540, 78), K(x + 50, top, 172), K(x - 6, 620, -102), K(x, 160, -89)]

def desc_left(x, exit_adv):
    """A descender loop swinging left (g, j, y, z): straight down past the
    baseline, round the bottom to the left, up the far side, back across the
    stem at the baseline and on into the exit."""
    return [K(x, 36, -90), K(x + 4, -200, -92), K(x - 58, DESC, 180), K(x - 122, -230, 82), K(x + 10, -6, 42), X(exit_adv)]

g("a", 520, bowl(), stem(TOP[0], TOP[1], 520))
g("b", 500, [*loop(), K(152, 36, -90), K(192, 0, 0), K(300, 120, 86), K(286, 300, 165), K(236, 304, 195), K(250, 294, -30), K(340, 236, -48), K(440, 80, -14), X(500, hin=16)])
g("c", 400, [*diag(98, 192), *arc(150, 160, 124, 160, 42, 306), X(400)])
g("d", 540, bowl(), stem(TOP[0], 620, 540))
g("e", 420, [E(), K(230, 236, 42), K(192, 320, 170), K(70, 190, -100), K(150, 8, -4), K(230, 24, 24), X(420)])
g("f", 420, [*loop(), K(152, 36, -90), K(154, -200, -90), K(190, DESC, 0), K(236, -230, 96), K(180, -20, 140), K(160, 60, 70)], [K(160, 60, 50), X(420)])
g("g", 520, bowl(), [K(TOP[0], TOP[1], -90), *desc_left(TOP[0] + 2, 520)])
g("h", 560, [*loop(), K(152, 36, -90)], [K(152, 130, 76), K(300, 318, 2), K(380, 220, -86)], stem(380, 220, 560))
g("i", 330, [E(), K(150, 318, 78)], stem(150, 318, 330), dot(176, 470, DOT))
g("dotlessi", 330, [E(), K(150, 318, 78)], stem(150, 318, 330), uni=0x131)
g("j", 330, [E(), K(150, 318, 78)], [K(150, 318, -92), *desc_left(152, 330)], dot(176, 470, DOT))
g("k", 520, [*loop(), K(152, 36, -90)], [K(152, 130, 74), K(300, 318, 4), K(342, 286, -64), K(296, 224, 186), K(270, 220, -26), K(362, 40, -56), K(400, 0, 10), X(520)])
g("l", 360, [*loop(), K(152, 36, -90), K(192, 0, 0), X(360)])
g("m", 820, [E(), K(130, 318, 4), K(230, 220, -86), K(230, 36, -90)], [K(230, 130, 76), K(380, 318, 4), K(480, 220, -86), K(480, 36, -90)], [K(480, 130, 76), K(630, 318, 4), K(730, 220, -86)], stem(730, 220, 820))
g("n", 570, [E(), K(130, 318, 4), K(230, 220, -86), K(230, 36, -90)], [K(230, 130, 76), K(380, 318, 4), K(480, 220, -86)], stem(480, 220, 570))
g("o", 440, [*diag(98, 192), *arc(150, 160, 122, 160, 42, 402), K(226, 296, 150, hout=14), K(218, 314, 60, hin=12, hout=12), K(238, 320, -20, hin=12), K(300, 288, -46), K(392, 122, -32), K(428, 64, -6), X(440, hin=10)])
g("p", 540, [E(), K(150, 318, 78)], [K(150, 318, -92), K(154, DESC, -90)], [K(154, -300, 90), K(152, 290, 88), K(230, 328, -8), K(316, 200, -88), K(250, 22, 190), K(190, 46, 118)], [K(190, 46, 20), K(236, 4, 0), X(540)])
g("q", 540, bowl(), [K(TOP[0], TOP[1], -90), K(TOP[0] + 3, -200, -92), K(350, DESC, 0), K(396, -230, 94), K(330, -30, 120), K(316, 20, 80), K(370, 60, 36), X(540)])
g("r", 400, [E(), K(150, 318, 50, hout=40), K(208, 328, -4, hin=30, hout=26), K(244, 300, -62, hin=26), K(258, 262, -90)], stem(258, 262, 400))
g("s", 400, [E(), K(214, 318, 48, hout=0), K(242, 250, -84, hin=50), K(214, 70, -128), K(150, 18, 188), K(112, 46, 104), K(140, 12, -8), X(400)])
g("t", 380, [E(), K(154, 560, 82)], stem(154, 560, 380), [K(80, 330, 4), K(260, 344, 6)])
g("u", 580, [E(), K(140, 318, 74)], [K(140, 318, -94), K(146, 40, -90), K(196, 0, 0), K(360, 110, 62), K(400, 318, 80)], stem(400, 318, 580))
g("v", 500, [E(), K(140, 318, 72)], [K(140, 318, -78), K(220, 10, -56, hout=0), K(260, 24, 56, hin=0), K(370, 250, 68), K(396, 324, 112), K(372, 330, 200), K(366, 300, -62), K(430, 160, -44), K(470, 70, -10), X(500, hin=16)])
g("w", 760, [E(), K(140, 318, 72)], [K(140, 318, -78), K(220, 10, -56, hout=0), K(260, 24, 56, hin=0), K(370, 250, 70), K(390, 318, 84)], [K(390, 318, -80), K(468, 10, -56, hout=0), K(508, 24, 56, hin=0), K(620, 250, 68), K(648, 324, 112), K(624, 330, 200), K(618, 300, -62), K(684, 160, -44), K(728, 70, -10), X(760, hin=16)])
g("x", 480, [E(), K(150, 318, 46, hout=0), K(170, 300, -50, hin=0), K(320, 10, -50), K(360, 0, 10), X(480)], [K(340, 318, -128), K(130, 8, -128)])
g("y", 580, [E(), K(140, 318, 74)], [K(140, 318, -94), K(146, 40, -90), K(196, 0, 0), K(360, 110, 62), K(400, 318, 80)], [K(400, 318, -92), *desc_left(402, 580)])
g("z", 520, [E(), K(140, 318, 10), K(286, 316, -20, hout=0), K(270, 290, 220, hin=0), K(222, 110, 222), K(262, 30, -50), K(310, -130, -94), K(258, DESC, 186), K(190, -240, 80), K(336, -6, 40), X(520)])


# ─── capitals — looped school-book forms, standing alone ─────────────────────
# Wide and tall, with the loops the copybook gives them. None joins into the
# word; each ends on a curl the next letter's undercurve can start beneath.
def cap_exit(x, adv):
    """The foot of a capital's last stem, swinging into a curl at the join height."""
    return [K(x, 36, -90), K(x + 44, 0, 0), K(adv, JOIN, 40)]

g("A", 700, [K(640, 660, 150), *arc(330, 330, 240, 330, 58, 412), K(582, 300, -92), K(584, 36, -90), K(628, 0, 0), K(700, JOIN, 40)], join=False)
g("B", 660, [K(230, 700, 190, hin=0, hout=50), K(166, 640, -100), K(150, 36, -90), K(190, 0, 0, hout=40), K(240, 40, 60)], [K(166, 640, 60, hin=0, hout=60), K(330, 712, -10), K(400, 560, -90), K(300, 400, 180), K(330, 400, -10), K(430, 230, -90), K(290, 20, 190), K(240, 60, 110)], join=False)
g("C", 600, [K(540, 640, 150), *arc(320, 360, 240, 340, 60, 318), K(600, 130, 40)], join=False)
g("D", 680, [K(200, 700, -100, hin=0), K(150, 36, -90), K(190, 0, 0), K(140, 60, 120, hin=40, hout=30), K(190, 10, -10), K(420, 40, 40), K(560, 300, 86), K(500, 640, 150), K(320, 716, 190), K(220, 650, 230)], join=False)
g("E", 620, [K(560, 640, 150), K(400, 720, 190), K(200, 560, -100), K(350, 380, -10, hout=20), K(300, 360, 200, hin=20), K(130, 190, -100), K(280, 10, 0), K(540, 60, 30), K(600, 150, 70)], join=False)
g("F", 640, [K(140, 650, 20), K(330, 716, -4), K(540, 650, -30)], [K(350, 690, -96), K(300, 36, -92), K(340, 0, 0), K(420, 60, 50)], [K(270, 370, 10), K(400, 384, 8)], join=False)
g("G", 640, [K(560, 640, 150), *arc(320, 360, 240, 340, 60, 332), K(520, 250, 92), K(510, 360, 100, hout=0), K(506, 36, -92, hin=0), K(550, 0, 0), K(640, JOIN, 40)], join=False)
g("H", 720, [K(190, 700, -98, hin=0), K(130, 36, -90), K(170, 0, 0), K(240, 70, 60)], [K(560, 700, -98, hin=0), K(500, 36, -90), K(544, 0, 0), K(640, JOIN, 40)], [K(150, 380, 6), K(540, 396, 6)], join=False)
g("I", 520, [K(360, 160, 110), K(380, 560, 86), K(350, 716, 180), K(240, 560, -108), K(200, 36, -100), K(130, 8, 190), K(96, 60, 100), K(180, 90, -10), K(340, 110, 20)], join=False)
g("J", 540, [K(140, 560, 62), K(300, 716, 6), K(366, 650, -86), K(330, -200, -94), K(230, -380, 190), K(140, -250, 86), K(300, -10, 32)], join=False)
g("K", 680, [K(190, 700, -98, hin=0), K(130, 36, -90), K(170, 0, 0), K(240, 70, 60)], [K(560, 690, 220), K(212, 420, 204, hout=24), K(236, 384, -32, hin=24), K(540, 20, -46), K(680, JOIN, 40)], join=False)
g("L", 700, [K(40, 430, 56), K(230, 690, 84), K(236, 720, 180), K(176, 600, -108), K(120, 160, -100), K(92, 20, 200), K(42, 56, 112), K(70, 112, 0), K(150, 70, -30), K(260, 14, -8), K(470, 24, 10), K(600, 70, 44), K(650, 160, 84)], join=False)
g("M", 900, [K(40, 100, 60), K(190, 680, 82), K(236, 716, -10), K(270, 420, -90), K(260, 36, -88, hout=0)], [K(260, 36, 88, hin=0), K(300, 440, 86), K(470, 716, 0), K(560, 420, -90), K(550, 36, -88, hout=0)], [K(550, 36, 88, hin=0), K(590, 440, 86), K(760, 716, 0), K(850, 420, -90), K(840, 36, -90), K(884, 0, 0), K(900, JOIN, 40, hin=10)], join=False)
g("N", 720, [K(40, 100, 60), K(190, 680, 82), K(236, 716, -10), K(270, 420, -90), K(260, 36, -88, hout=0)], [K(260, 36, 88, hin=0), K(300, 440, 86), K(470, 716, 0), K(560, 420, -90), K(550, 36, -90), K(594, 0, 0), K(720, JOIN, 40)], join=False)
g("O", 680, [K(560, 640, 150), *arc(330, 360, 240, 340, 58, 428), K(540, 700, -30, hin=30, hout=30), K(590, 590, -70)], join=False)
g("P", 640, [K(190, 700, -98, hin=0), K(130, 36, -90, hout=0)], [K(170, 700, 80, hin=0), K(360, 716, -10), K(440, 560, -90), K(300, 390, 190), K(236, 400, 200)], join=False)
g("Q", 680, [K(560, 640, 150), *arc(330, 360, 240, 340, 58, 400)], [K(330, 70, -40), K(440, -40, -10), K(600, 30, 30)], join=False)
g("R", 680, [K(190, 700, -98, hin=0), K(130, 36, -90, hout=0)], [K(170, 700, 80, hin=0), K(360, 716, -10), K(440, 560, -90), K(300, 390, 190), K(250, 396, 220, hout=0), K(290, 380, -30, hin=0), K(530, 20, -46), K(680, JOIN, 40)], join=False)
g("S", 640, [K(50, 90, 42), K(300, 540, 70), K(340, 720, 168), K(250, 660, -104), K(300, 420, -40), K(420, 250, -70), K(340, 40, 200), K(190, 16, 170), K(140, 70, 96), K(190, 118, -10), K(260, 90, -40)], join=False)
g("T", 660, [K(140, 650, 20), K(330, 716, -4), K(560, 650, -30)], [K(350, 690, -96), K(300, 36, -92), K(340, 0, 0), K(420, 60, 50)], join=False)
g("U", 740, [K(60, 540, 72), K(150, 700, 60, hout=0), K(186, 100, -90, hin=0), K(300, 6, 0), K(500, 260, 82), K(530, 700, 84, hout=0), K(540, 36, -90, hin=0), K(584, 0, 0), K(740, JOIN, 40)], join=False)
g("V", 660, [K(60, 540, 72), K(150, 700, 60, hout=0), K(230, 100, -78, hin=0), K(290, 6, 20, hout=0), K(520, 560, 70, hin=0), K(560, 700, 60), K(630, 650, -40)], join=False)
g("W", 940, [K(60, 540, 72), K(150, 700, 60, hout=0), K(230, 100, -78, hin=0), K(290, 6, 20, hout=0), K(450, 560, 72, hin=0), K(480, 700, 80, hout=0), K(510, 100, -78, hin=0), K(570, 6, 20, hout=0), K(800, 560, 70, hin=0), K(840, 700, 60), K(910, 650, -40)], join=False)
g("X", 660, [K(100, 700, -50), K(500, 20, -50), K(560, 0, 10), K(660, JOIN, 40)], [K(560, 700, -130), K(140, 10, -130)], join=False)
g("Y", 700, [K(60, 540, 72), K(150, 700, 60, hout=0), K(186, 160, -90, hin=0), K(300, 60, 0), K(500, 260, 82), K(530, 700, 84, hout=0), K(534, 36, -90, hin=0), K(538, -200, -92), K(470, DESC, 182), K(400, -250, 84), K(540, -6, 42), K(700, JOIN, 40)], join=False)
g("Z", 660, [K(90, 650, 22), K(330, 716, -4), K(560, 650, -36, hout=0), K(180, 40, 216, hin=0, hout=0), K(360, 10, 6, hin=0), K(620, 60, 20)], join=False)

# ─── figures ──────────────────────────────────────────────────────────────────
g("zero", 420, arc(200, 310, 140, 320, 90, 450), join=False, uni=ord("0"))
g("one", 360, [K(120, 480, 60, h=60), K(200, 640, 80, hin=60, hout=0), K(205, 0, -88, hin=0, hout=40)], join=False, uni=ord("1"))
g("two", 420, [K(100, 500, 70, hin=0, hout=80), K(200, 640, 0, hin=80, hout=80), K(300, 500, -80, hin=80, hout=100), K(100, 30, 220, hin=150, hout=40), K(150, 5, 0, hin=40, hout=60), K(380, 20, 10, hin=80)], join=False, uni=ord("2"))
g("three", 420, [K(100, 580, 40, hin=0, hout=60), K(210, 640, 0, hin=60, hout=70), K(300, 520, -90, hin=70, hout=70), K(210, 370, 180, hin=70, hout=0), K(214, 370, 0, hin=0, hout=60), K(320, 200, -90, hin=70, hout=70), K(190, 5, 190, hin=70, hout=60), K(90, 80, 120, hin=50)], join=False, uni=ord("3"))
g("four", 440, [K(300, 640, -115, hin=0, hout=200), K(60, 220, -10, hin=120, hout=60), K(400, 230, 0, hin=60)], [K(300, 500, -90, h=80), K(300, 0, -90, h=80)], join=False, uni=ord("4"))
g("five", 420, [K(330, 640, 180, hin=0, hout=60), K(150, 640, -100, hin=60, hout=100), K(130, 380, -60, hin=80, hout=60), K(250, 400, -10, hin=60, hout=80), K(340, 220, -90, hin=80, hout=80), K(200, 5, 190, hin=80, hout=60), K(90, 90, 120, hin=50)], join=False, uni=ord("5"))
g("six", 420, [K(300, 620, 150, hin=0, hout=80), K(130, 400, -100, hin=120, hout=140), K(100, 150, -80, hin=120, hout=80), K(220, 5, 0, hin=80, hout=80), K(340, 150, 90, hin=80, hout=80), K(220, 300, 180, hin=80, hout=80), K(110, 170, -100, hin=80)], join=False, uni=ord("6"))
g("seven", 400, [K(80, 600, 20, hin=0, hout=60), K(330, 640, -10, hin=60, hout=60), K(200, 300, -115, hin=100, hout=100), K(150, 0, -100, hin=100)], join=False, uni=ord("7"))
g("eight", 420, [K(290, 600, 130, hin=0, hout=80), K(180, 650, 180, hin=60, hout=60), K(90, 520, -80, hin=70, hout=80), K(300, 200, -60, hin=120, hout=100), K(200, 5, 180, hin=80, hout=70), K(80, 150, 70, hin=80, hout=100), K(300, 520, 60, hin=120, hout=60), K(292, 600, 130, hin=60)], join=False, uni=ord("8"))
g("nine", 420, [K(300, 450, 90, hin=0, hout=80), K(190, 640, 180, hin=80, hout=80), K(90, 480, -90, hin=80, hout=80), K(190, 330, 0, hin=80, hout=80), K(300, 450, 90, hin=80, hout=0), K(290, 100, -100, hin=0, hout=120), K(150, 10, 190, hin=80)], join=False, uni=ord("9"))

# ─── punctuation and symbols ──────────────────────────────────────────────────
g("period", 200, dot(100, 20, 16), join=False, uni=ord("."))
g("comma", 200, [K(115, 30, -100, hin=0, hout=30), K(70, -90, -130, hin=50)], join=False, uni=ord(","))
g("colon", 200, dot(100, 30, 16), dot(100, 300, 16), join=False, uni=ord(":"))
g("semicolon", 200, dot(100, 300, 16), [K(115, 30, -100, hin=0, hout=30), K(70, -90, -130, hin=50)], join=False, uni=ord(";"))
g("exclam", 220, [K(122, 640, -92, hin=0, hout=200), K(106, 150, -95, hin=200)], dot(100, 20, 16), join=False, uni=ord("!"))
g("question", 380, [K(90, 520, 60, hin=0, hout=80), K(200, 640, 0, hin=80, hout=80), K(310, 500, -90, hin=80, hout=80), K(200, 320, -120, hin=80, hout=60), K(190, 150, -95, hin=60)], dot(190, 20, 16), join=False, uni=ord("?"))
g("quotesingle", 160, [K(92, 640, -95, h=40), K(72, 520, -100, h=40)], join=False, uni=ord("'"))
g("quotedbl", 270, [K(82, 640, -95, h=40), K(62, 520, -100, h=40)], [K(192, 640, -95, h=40), K(172, 520, -100, h=40)], join=False, uni=ord('"'))
g("quoteright", 180, [K(112, 640, -100, hin=0, hout=30), K(70, 520, -130, hin=50)], join=False, uni=0x2019)
g("quoteleft", 180, [K(70, 530, 80, hin=0, hout=30), K(112, 650, 50, hin=50)], join=False, uni=0x2018)
g("quotedblright", 290, [K(112, 640, -100, hin=0, hout=30), K(70, 520, -130, hin=50)], [K(222, 640, -100, hin=0, hout=30), K(180, 520, -130, hin=50)], join=False, uni=0x201D)
g("quotedblleft", 290, [K(70, 530, 80, hin=0, hout=30), K(112, 650, 50, hin=50)], [K(180, 530, 80, hin=0, hout=30), K(222, 650, 50, hin=50)], join=False, uni=0x201C)
g("hyphen", 300, [K(60, 300, 5, h=60), K(240, 312, 5, h=60)], join=False, uni=ord("-"))
g("endash", 500, [K(40, 300, 3, h=100), K(460, 308, 3, h=100)], join=False, uni=0x2013)
g("emdash", 800, [K(40, 300, 2, h=200), K(760, 308, 2, h=200)], join=False, uni=0x2014)
g("parenleft", 280, [K(210, 680, 190, hin=0, hout=150), K(90, 200, -90, hin=200, hout=200), K(210, -260, -10, hin=150)], join=False, uni=ord("("))
g("parenright", 280, [K(70, 680, -10, hin=0, hout=150), K(190, 200, -90, hin=200, hout=200), K(70, -260, 190, hin=150)], join=False, uni=ord(")"))
g("bracketleft", 280, [K(220, 680, 180, h=40), K(110, 680, -90, h=200), K(110, -260, 0, h=40), K(220, -260, 0, h=40)], join=False, uni=ord("["))
g("bracketright", 280, [K(60, 680, 0, h=40), K(170, 680, -90, h=200), K(170, -260, 180, h=40), K(60, -260, 180, h=40)], join=False, uni=ord("]"))
g("braceleft", 300, [K(240, 680, 180, hin=0, hout=50), K(160, 580, -90, hin=60, hout=120), K(150, 250, -110, hin=120, hout=40), K(80, 210, 200, hin=40, hout=40), K(150, 170, -70, hin=40, hout=40), K(160, -160, -90, hin=120, hout=60), K(240, -260, 0, hin=50)], join=False, uni=ord("{"))
g("braceright", 300, [K(60, 680, 0, hin=0, hout=50), K(140, 580, -90, hin=60, hout=120), K(150, 250, -70, hin=120, hout=40), K(220, 210, -20, hin=40, hout=40), K(150, 170, -110, hin=40, hout=40), K(140, -160, -90, hin=120, hout=60), K(60, -260, 180, hin=50)], join=False, uni=ord("}"))
g("slash", 360, [K(60, -100, 66, h=100), K(300, 700, 66, h=100)], join=False, uni=ord("/"))
g("backslash", 360, [K(60, 700, -66, h=100), K(300, -100, -66, h=100)], join=False, uni=ord("\\"))
g("ampersand", 560, [K(420, 560, 140, hin=0, hout=80), K(300, 650, 180, hin=60, hout=60), K(200, 540, -100, hin=60, hout=100), K(380, 250, -50, hin=140, hout=100), K(300, 20, 190, hin=100, hout=80), K(120, 150, 80, hin=80, hout=100), K(380, 480, 50, hin=160, hout=80), K(520, 200, -80, hin=120, hout=60)], join=False, uni=ord("&"))
g("at", 640, [K(430, 420, 150, hin=0, hout=60), *arc(320, 300, 110, 150, 60, 420), K(430, 150, -90, hin=50, hout=60), K(500, 100, 20, hin=60, hout=120), K(560, 300, 100, hin=120, hout=160), K(320, 620, 180, hin=160, hout=200), K(60, 300, -90, hin=200, hout=200), K(320, -40, 0, hin=200, hout=120), K(520, 20, 20, hin=100)], join=False, uni=ord("@"))
g("numbersign", 500, [K(200, 600, -100, h=120), K(130, 0, -100, h=120)], [K(360, 600, -100, h=120), K(290, 0, -100, h=120)], [K(60, 400, 0, h=100), K(460, 400, 0, h=100)], [K(40, 200, 0, h=100), K(440, 200, 0, h=100)], join=False, uni=ord("#"))
g("dollar", 460, [K(360, 540, 150, hin=0, hout=80), K(230, 620, 180, hin=70, hout=70), K(110, 490, -90, hin=70, hout=90), K(330, 220, -60, hin=120, hout=100), K(230, 20, 190, hin=80, hout=70), K(100, 110, 120, hin=60)], [K(240, 700, -90, h=200), K(220, -80, -90, h=200)], join=False, uni=ord("$"))
g("percent", 600, [K(100, -20, 70, h=120), K(480, 660, 70, h=120)], arc(140, 500, 80, 110, 90, 450), arc(460, 120, 80, 110, 90, 450), join=False, uni=ord("%"))
g("asterisk", 400, [K(200, 620, -90, h=60), K(200, 340, -90, h=60)], [K(80, 550, -30, h=60), K(320, 410, -30, h=60)], [K(80, 410, 30, h=60), K(320, 550, 30, h=60)], join=False, uni=ord("*"))
g("plus", 480, [K(240, 460, -90, h=80), K(240, 100, -90, h=80)], [K(60, 280, 0, h=80), K(420, 280, 0, h=80)], join=False, uni=ord("+"))
g("equal", 480, [K(60, 360, 0, h=80), K(420, 360, 0, h=80)], [K(60, 200, 0, h=80), K(420, 200, 0, h=80)], join=False, uni=ord("="))
g("less", 420, [K(340, 520, 200, h=100), K(80, 280, -30, hin=40, hout=40), K(340, 40, -20, h=100)], join=False, uni=ord("<"))
g("greater", 420, [K(80, 520, -20, h=100), K(340, 280, -150, hin=40, hout=40), K(80, 40, 200, h=100)], join=False, uni=ord(">"))
g("underscore", 500, [K(0, -80, 0, h=100), K(500, -80, 0, h=100)], join=False, uni=ord("_"))
g("asciitilde", 440, [K(60, 280, 40, hin=0, hout=80), K(170, 340, 0, hin=80, hout=80), K(290, 250, 0, hin=80, hout=80), K(400, 310, 40, hin=80)], join=False, uni=ord("~"))
g("asciicircum", 360, [K(60, 460, 60, h=100), K(180, 650, 60, h=100)], [K(180, 650, -60, h=100), K(300, 460, -60, h=100)], join=False, uni=ord("^"))
g("bar", 220, [K(110, 720, -90, h=100), K(110, -240, -90, h=100)], join=False, uni=ord("|"))
g("grave", 300, [K(110, 600, -55, h=40), K(190, 480, -55, h=40)], join=False, uni=ord("`"))
g("sterling", 500, [K(340, 560, 150, hin=0, hout=60), K(230, 640, 180, hin=60, hout=70), K(150, 500, -100, hin=70, hout=120), K(115, 30, -110, hin=120, hout=40), K(90, 8, 200, hin=40, hout=30), K(200, 30, 0, hin=60, hout=80), K(380, 50, 10, hin=80)], [K(60, 320, 0, h=40), K(250, 320, 0, h=40)], join=False, uni=0xA3)
g("Euro", 560, [K(470, 560, 150, hin=0, hout=60), *arc(300, 330, 190, 300, 50, 310)], [K(80, 400, 0, h=50), K(330, 400, 0, h=50)], [K(60, 260, 0, h=50), K(310, 260, 0, h=50)], join=False, uni=0x20AC)
g("degree", 260, arc(130, 560, 60, 60, 0, 360), join=False, uni=0xB0)
g("bullet", 300, dot(150, 250, 40), join=False, uni=0x2022)
g("ellipsis", 600, dot(100, 20, 16), dot(300, 20, 16), dot(500, 20, 16), join=False, uni=0x2026)

# ─── accents (fontforge composes the accented letters from these) ─────────────
g("acute", 300, [K(120, 480, 55, h=40), K(200, 600, 55, h=40)], join=False, uni=0xB4)
g("circumflex", 300, [K(90, 480, 60, h=40), K(150, 600, 60, h=40)], [K(150, 600, -60, h=40), K(210, 480, -60, h=40)], join=False, uni=0x2C6)
g("tilde", 300, [K(70, 500, 40, hin=0, hout=50), K(130, 545, 0, hin=50, hout=50), K(190, 485, 0, hin=50, hout=50), K(250, 525, 40, hin=50)], join=False, uni=0x2DC)
g("dieresis", 300, dot(100, 545, 14), dot(200, 545, 14), join=False, uni=0xA8)
g("ring", 300, arc(150, 560, 45, 45, 0, 360), join=False, uni=0x2DA)
g("cedilla", 300, [K(150, 0, -80, hin=0, hout=50), K(172, -70, -100, hin=40, hout=40), K(110, -112, 180, hin=40)], join=False, uni=0xB8)
g("caron", 300, [K(90, 600, -60, h=40), K(150, 480, -60, h=40)], [K(150, 480, 60, h=40), K(210, 600, 60, h=40)], join=False, uni=0x2C7)
