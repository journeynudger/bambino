# Lorenzo Meadow

The prairie family. Four faces that belong on ruled paper:

| family | file | weight | what it is |
|---|---|---:|---|
| Lorenzo Meadow Script | `LorenzoMeadow-Script` | 400 | a thin print-script: round, open, every letter standing on its own with a small lead-in where the pen lands; tall, airy ascenders and long descenders |
| Lorenzo Meadow Stitched | `LorenzoMeadow-Stitched` | 400 | the same script sewn as a running stitch |
| Lorenzo Meadow Sans | `LorenzoMeadowSans-Light` | 300 | a wide, light geometric sans drawn by hand — every letter a little off true, the way a ruled line is |
| Lorenzo Meadow Sans | `LorenzoMeadowSans-Regular` | 400 | the same, a nib heavier |
| Lorenzo Meadow Ornaments | `LorenzoMeadow-Ornaments` | 400 | fourteen ornaments on `a`–`n` (and `A`–`N`) |

The ornaments, in order: `a` sprig, `b` speckle, `c` bow, `d` dotted ring,
`e` petals, `f` hearts, `g` daisy, `h` berries, `i` branch, `j` buds,
`k` tulip, `l` blossoms, `m` leaves, `n` big bow.

The script's lowercase is its own drawing (`tools/meadow/script_glyphs.py`);
its capitals, figures, punctuation and accents are the Longhand hand written
with the thinner nib and a gentler slant (10°) — the same hand, printing
instead of running on. The sans is the typewriter's skeleton drawn wide and
single-storey, with a few kerning pairs. Coverage for Script, Stitched and
Sans: A–Z, a–z, 0–9, punctuation and symbols, the accented Latin letters.
Each file: TTF and WOFF2.

## Source

    fontforge -lang=py -script tools/meadow/build.py app/assets/fonts/lorenzo-meadow

`/lorenzo/meadow` shows every glyph and the ornaments with their names, with
a line to try each face on; `/lorenzo?paper=meadow` reads the whole site on
the ruled paper, set in these faces.

## Using it on a page

```css
@font-face {
  font-family: "Lorenzo Meadow Script";
  src: url("LorenzoMeadow-Script.woff2") format("woff2"),
       url("LorenzoMeadow-Script.ttf") format("truetype");
  font-weight: 400;
  font-display: swap;
}
/* one block per file; Lorenzo Meadow Sans has two, at 300 and 400 */
```

## Licence

© 2026 Lorenzo Scardicchio. Drawn for lorenzoscardicchio.com; no licence has
been chosen yet, so treat the files as all rights reserved until one is.
