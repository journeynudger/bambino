# Lorenzo Typewriter

A soft, hand-drafted slab-serif monospace — ten characters to the inch, a
slab on every stem, ink pressed into paper — and its sans, which keeps the
same cell and the same ink and takes the slabs off (only `i`, `j` and `l`
keep a foot and a flag, so a column of them still reads). Four weights of
each, Thin to Bold, because a carbon copy and a fresh ribbon are not the
same page.

| family | file | weight |
|---|---|---:|
| Lorenzo Typewriter | `LorenzoTypewriter-Thin` | 100 |
| Lorenzo Typewriter | `LorenzoTypewriter-Light` | 300 |
| Lorenzo Typewriter | `LorenzoTypewriter-Regular` | 400 |
| Lorenzo Typewriter | `LorenzoTypewriter-Bold` | 700 |
| Lorenzo Typewriter Sans | `LorenzoTypewriterSans-Thin` | 100 |
| Lorenzo Typewriter Sans | `LorenzoTypewriterSans-Light` | 300 |
| Lorenzo Typewriter Sans | `LorenzoTypewriterSans-Regular` | 400 |
| Lorenzo Typewriter Sans | `LorenzoTypewriterSans-Bold` | 700 |

Every glyph advances 600 units on a 1000-unit em: a true monospace. Cap
height 600, x-height 430, ascender 640, descender −200; ascent 780 /
descent 220 with a 200 line gap, the same vertical metrics as the other
Lorenzo families so they sit on one baseline.

Coverage: A–Z, a–z, 0–9, punctuation and symbols
(`.,;:!?'"‘’“”-–—()[]{}/\|&@#$%*+=<>_~^£€°•…`), and the accented Latin
letters (À–Ü, à–ü, Ç ç Ñ ñ Ÿ ÿ Š š Ž ž). Each file: TTF and WOFF2.

## Source

Nothing here was traced. Every letter is a centreline drawing in
`tools/skeleton.py` — a skeleton the meadow sans shares at wider
proportions — set into the cell, expanded with a round nib for the weight,
and roughened along the edge so it reads as ink rather than a vector.
`tools/typewriter/build.py` adds the slabs and vertical serifs for the serif
styles, composes the accented letters, and writes these files:

    fontforge -lang=py -script tools/typewriter/build.py app/assets/fonts/lorenzo-typewriter

Edit a letter in `skeleton.py`, rebuild, and `/lorenzo/typewriter` shows
every glyph, with a line to try each weight on.

## Using it on a page

```css
@font-face {
  font-family: "Lorenzo Typewriter";
  src: url("LorenzoTypewriter-Regular.woff2") format("woff2"),
       url("LorenzoTypewriter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-display: swap;
}
/* one block per file; the weights are 100, 300, 400 and 700 */
```

## Licence

© 2026 Lorenzo Scardicchio. Drawn for lorenzoscardicchio.com; no licence has
been chosen yet, so treat the files as all rights reserved until one is.
