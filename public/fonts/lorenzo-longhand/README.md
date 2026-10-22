# Lorenzo Longhand

An original monoline longhand in the Palmer-method school-book hand: oval
bowls, looped ascenders and descenders, every lowercase letter entering and
leaving on the same connector so words join. Three weights, like a pen:

| file | weight | nib |
|---|---|---|
| `LorenzoLonghand-Ballpoint` | 300 | thin, clean |
| `LorenzoLonghand-Graphite`  | 400 | medium, with a pencil-grit edge |
| `LorenzoLonghand-Inkwell`   | 600 | heavy, clean |

Coverage: A–Z, a–z, 0–9, punctuation and symbols (`.,;:!?'"‘’“”-–—()[]{}/\&@#$%*+=<>_~^|£€°•…`),
and the accented Latin letters (À–Ü, à–ü, Ç ç Ñ ñ Ÿ ÿ Š š Ž ž).

## Source

Nothing here was traced. Every glyph is written as pen strokes — a position
and a direction of travel at each turn — in `tools/fonts/longhand/glyphs.py`, in
the small stroke language of `tools/fonts/longhand/pen.py`. `tools/fonts/longhand/build.py`
slants the strokes and, through `tools/fonts/ttbuild.py` (skia-pathops for the
nib and the overlaps, fontTools for the files — no fontforge), expands them with a
round nib of each weight, roughens the Graphite edge, composes the accented
letters, and writes these files:

    python3 tools/fonts/longhand/build.py public/fonts/lorenzo-longhand   # needs skia-pathops, fonttools, brotli

Edit a letter in `glyphs.py`, rebuild with `--preview sheet.png` to see every
line of it at once, and the mailroom's specimen page shows every glyph.

## Licence

© 2026 Lorenzo Scardicchio. Drawn for lorenzoscardicchio.com; no licence has
been chosen yet, so treat the files as all rights reserved until one is.
