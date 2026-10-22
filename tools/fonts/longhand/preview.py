"""preview.py — draw every glyph's centreline (and some joined words) as an
HTML page of inline SVG, so the alphabet can be judged before the font is built.
    python3 preview.py out.html [stroke_width]"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pen import svg_path, H, ASC, CAP, DESC, JOIN, SLANT
from glyphs import GLYPHS

out = sys.argv[1]
sw = float(sys.argv[2]) if len(sys.argv) > 2 else 34
SCALE = 0.18

def glyph_svg(name, x=0):
    gl = GLYPHS[name]
    return f'<path transform="translate({x:.1f} 0)" d="{svg_path(gl["strokes"])}"/>'

def word_svg(text, start_x=0):
    x = start_x; parts = []
    for ch in text:
        if ch == " ":
            x += 260; continue
        if ch in GLYPHS:
            parts.append(glyph_svg(ch, x)); x += GLYPHS[ch]["adv"]
        else:
            x += 300
    return "".join(parts), x

def guides(width):
    return (f'<line x1="0" x2="{width}" y1="0" y2="0" stroke="#c9b" stroke-width="2" vector-effect="non-scaling-stroke"/>'
            f'<line x1="0" x2="{width}" y1="{-H}" y2="{-H}" stroke="#9bd" stroke-width="2" stroke-dasharray="8 8" vector-effect="non-scaling-stroke"/>'
            f'<line x1="0" x2="{width}" y1="{-ASC}" y2="{-ASC}" stroke="#ddd" stroke-width="2" vector-effect="non-scaling-stroke"/>'
            f'<line x1="0" x2="{width}" y1="{-DESC}" y2="{-DESC}" stroke="#ddd" stroke-width="2" vector-effect="non-scaling-stroke"/>'
            f'<line x1="0" x2="{width}" y1="{-JOIN}" y2="{-JOIN}" stroke="#eee" stroke-width="2" vector-effect="non-scaling-stroke"/>')

rows = []
names = list(GLYPHS.keys())
per_row = 9
for i in range(0, len(names), per_row):
    chunk = names[i:i + per_row]
    x = 0; parts = []
    for n in chunk:
        parts.append(f'<rect x="{x}" y="{-ASC - 40}" width="{GLYPHS[n]["adv"]}" height="{ASC + 40 - DESC + 40}" fill="none" stroke="#eee" stroke-width="2" vector-effect="non-scaling-stroke"/>')
        parts.append(glyph_svg(n, x))
        parts.append(f'<text x="{x + 10}" y="{-DESC + 70}" font-size="60" font-family="monospace" fill="#888">{n}</text>')
        x += GLYPHS[n]["adv"] + 60
    rows.append((x, "".join(parts)))

samples = ["lorenzo longhand", "the quick brown fox jumps", "over the lazy dog", "it rained today and we danced barefoot", "abcdefghijklm", "nopqrstuvwxyz"]
html = ['<!doctype html><meta charset="utf-8"><body style="margin:20px;background:#f3eedc;font-family:monospace">']
for width, inner in rows:
    vb_w = width + 200
    html.append(f'<svg width="{vb_w*SCALE:.0f}" height="{(ASC - DESC + 160)*SCALE:.0f}" viewBox="-20 {-ASC-80} {vb_w} {ASC - DESC + 160}" style="display:block;margin-bottom:6px"><g fill="none" stroke="#2a2520" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{guides(width)}{inner}</g></svg>')
for s in samples:
    inner, w = word_svg(s)
    html.append(f'<svg width="{(w+100)*SCALE:.0f}" height="{(ASC - DESC + 120)*SCALE:.0f}" viewBox="-20 {-ASC-40} {w+100} {ASC - DESC + 120}" style="display:block;margin-bottom:4px"><g fill="none" stroke="#2a2520" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{guides(w)}{inner}</g></svg>')
html.append("</body>")
open(out, "w").write("\n".join(html))
print("preview:", out, "glyphs:", len(names))
