Display font slots. The site checks these in order and uses whichever is present:

  1. Old Claude LP   — OldClaudeLP-Regular.woff2 (+ .woff)
  2. Blacker Pro Display — BlackerProDisplay-Light.woff2 / -LightItalic.woff2
  3. EB Garamond (bundled, SIL OFL) — the current default, no action needed

NOTE ON OLD CLAUDE LP
The file in ~/Downloads is Copyright (c) 1997 Adobe Systems Incorporated,
"Old Claude is a trademark of LetterPerfect Design", and carries no license
grant (it came from the fontsgeek.com aggregator). Serving it as a webfont
distributes it to every visitor, which needs a webfont license from the
foundry. Buy one and drop the files here and it takes over automatically.

It is also roman-only. Because the @font-face declares font-style: normal,
italic text correctly falls through to EB Garamond's true italic — the site
uses italics heavily ("The Notebooks *of*", "*Chapter*", pull quotes).

EB Garamond is a revival of the same Claude Garamond source material, which
is why it sits so close to Old Claude in feel.
Blacker Pro licensing: https://www.zetafonts.com/blacker
