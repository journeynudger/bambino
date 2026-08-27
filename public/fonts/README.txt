Display font slots. The site checks these in order and uses whichever is present:

  1. Old Claude LP       — OldClaudeLP-Regular.woff2  ← ACTIVE
  2. Blacker Pro Display — BlackerProDisplay-Light.woff2 / -LightItalic.woff2
  3. EB Garamond (bundled via next/font, SIL OFL)

OLD CLAUDE LP — roman only, by design
Lorenzo holds the license for this typeface. The webfont here was converted
from his TTF (fontTools, 272KB TTF -> 71KB woff2, 231 glyphs).

The family ships Regular only — no italic. The @font-face therefore declares
font-style: normal exclusively, so italic text falls through to EB Garamond's
true cut italic rather than being synthetically slanted. This is deliberate:
the design uses italics constantly ("The Notebooks *of*", "*Chapter*", every
pull quote). The pairing works because EB Garamond is a revival of the same
Claude Garamond source material that Old Claude revives.

If an italic companion is ever licensed, add it as a second @font-face with
font-style: italic in app/globals.css and it takes over automatically.

Blacker Pro licensing: https://www.zetafonts.com/blacker
