# bambino

The notebooks of Lorenzo Scardicchio — essays and artwork, typeset like a book.
Design language after the Stripe Press *Poor Charlie's Almanack* web edition:
paper `#EFEFEF`, ink `#2d2d2d`, mono running heads, framed figure collages,
unrolling parchment preambles, and dark Previous/Next chapter spreads.

## Stack

- **Next.js** (App Router, static generation) + **Tailwind CSS v4** + shadcn
- **[Paper Shaders](https://github.com/paper-design/shaders)** — WebGL
  `PaperTexture` on the parchment panels, `ImageDithering` for the duotone
  dithered portrait treatment
- **[Paper Mono](https://github.com/paper-design/paper-mono)** — self-hosted
  variable font (SIL OFL 1.1, license in `app/fonts/`)
- Display type: **Old Claude LP** (licensed; roman-only, so italics fall
  through to **EB Garamond**, a revival of the same Garamond source). Slots for
  Blacker Pro Display also exist — see `public/fonts/README.txt`.
- Text: **Source Serif 4** (Google Fonts, loaded at build)

## Scroll system

`components/scroll-fx.tsx` — one rAF-throttled scroll engine driving
data-attributes, reconstructed from the Almanack bundle:

| attribute | effect |
| --- | --- |
| `data-fx-header` | chapter opening blurs `8px·e` and fades out over the first viewport (`e = scrollY/vh`) |
| `data-fx-parallax` | collage children drift upward at staggered speeds with fixed rotations |
| `data-fx-rollup` | parchment sheet pins under the chrome and rolls up at scroll speed — the page slides beneath it (`--rolled` 0→1) |
| `data-fx-reveal` | cosine-eased fade/rise on entering the viewport |
| `data-fx-drift` | gentle positional parallax for sticky figures |
| `data-progress` | reading-progress percentage in the bottom bar |

## The gallery wall (`/gallery`)

`components/gallery/wall.tsx` + `app/(gallery)/gallery.css`. The exact
interaction, for reuse elsewhere:

**The wall.** A fixed, full-viewport surface (`position: fixed; inset: 0;
overflow: hidden; touch-action: none; cursor: grab`). Inside it one
absolutely-positioned "lattice" div is moved with
`transform: translate3d(x, y, 0)`; nothing on the page scrolls natively
(`html, body { overflow: hidden; overscroll-behavior: none }`). Tiles are
squares of side `T = clamp(300, min(vw / 3.15, vh / 1.85), 640)` on desktop
and `T = vw / 2` at ≤ 768px, each placed at `translate(col·T, row·T)` within
the lattice. Only tiles inside the viewport ±1 are rendered: the visible
column range is `floor(-x / T) - 1 … ceil((vw - x) / T)`, same for rows.
The lattice is endless; cell `(col, row)` shows work `((col + row·K) mod n)`
with `K = ceil(√n)`, so a window a few tiles wide never repeats a work side
by side. First paint centres the *home* cell `(h, 0)` in the viewport —
`h` = the index of the deep-linked work, else 0, so the first work in
`content/gallery.yml` is the one a visitor meets, lit.

**Moving it.** `pointerdown` records the press; a `pointermove` further than
the slop (5px mouse, 12px touch, 8px pen) turns it into a drag
(`setPointerCapture`, cursor `grabbing`) and every move adds its delta to
`(x, y)`. Velocity is smoothed, `v = 0.6·v + 0.4·(Δ / Δt)` with `Δt ≥ 4ms`,
so one jittery last sample cannot throw the wall. On `pointerup` after a
drag the wall glides — `v` clamped to 1.8 px/ms, each frame
`v *= f; x += v·16ms` with `f` = 0.94 mouse / 0.92 touch / 0.93 pen, until
`|v| < 0.08` — unless the pointer had been still for 80ms before lifting,
in which case it stops dead. A `pointerup` that never became a drag and
came within 500ms of the press is a tap on the painting under it (the
`.plaque`, not the whole cell). `wheel` (passive) subtracts
`deltaX/deltaY` from `(x, y)`, so trackpad and mouse wheel pan in any
direction. Arrow keys pan by `T / 2`; tiles are `role="button"
tabIndex=0`, Enter/Space opens them, Escape closes. Position lives in a
ref and is applied straight to the transform each frame; React re-renders
only when the set of visible cells changes.

**One lit painting.** Every tile holds the work twice: `img.relief` (the
white cast, always visible) and `img.paint` (the painting, opacity 0, 0.7s
ease). Exactly one cell is *lit* at any time — React state keyed by lattice
cell, not `:hover`, so a work that recurs along the diagonal lights only
once and a phone behaves like a mouse. On the lit cell the cast lifts 3px
with a deeper drop-shadow, the paint fades to 1 and the title
(`.tile-name`, letter-spaced small caps) fades in under it. On arrival the
home cell is lit. A mouse lights whatever `.plaque` it enters
(`pointerenter`, `pointerType === "mouse"`, ignored mid-drag); leaving
does not unlight it, so the last painting looked at stays lit. A tap
(touch/pen) on an unlit painting lights it and nothing more; a tap or click
on the lit painting opens it. So: desktop hover → click, phone tap → tap.
Keyboard focus shows the colour via `:focus-visible`; Enter/Space opens.
Closing leaves the painting lit. There is deliberately no spotlight or
glow: the colour just appears.

**Opening a work.** Click/tap/Enter on the lit painting: `pushState` to
`/gallery/<slug>`; a
`.veil` (paper colour, 95% opaque) fades in over the wall in 0.7s; a fixed
`.focus` element the size of the painting (`min(64vh, 720px)` on its longer
side, centred in the space left of the sheet, i.e. at
`x = (vw - panelWidth) / 2`) is first placed exactly over the tile's cast
(FLIP: `translate(dx, dy) scale(tileWidth / finalWidth)`, no transition),
then on the next frame released to `transform: none` with
`transition: transform 1.25s cubic-bezier(.22, 1, .36, 1), opacity .8s`,
so the painting travels from its tile to the centre. Its paint image fades
in 0.45s later over 1.3s. The sheet (`aside.panel`, 440px; 520px ≥ 1600;
580px ≥ 1920) slides in from the right with the same easing over 1.05s;
its left edge is a soft `mask-image` gradient, not a hard line. Close
(×, Escape, veil click, the focused painting): everything reverses and
`pushState` returns to `/gallery`; back/forward buttons work the same way
via `popstate`. A deep link renders with the work already open.

**Phone (≤ 768px).** Two tiles across, the sheet rises from the bottom as
a 62vh card with 18px top radii, and the opened painting sits in the
remaining top 38vh (`cy = 0.19vh`, longer side `min(62vw, 32vh)`).

## Content pipeline

- `scripts/scrape_substack.py` — pulls every public post from
  lorenzoscardicchio.substack.com into `content/posts/*.json`, localizes all
  images into `public/posts/<slug>/`
- `scripts/rebalance_posts.py` — re-serializes the Substack HTML into
  well-formed markup (hydration-safe), strips widgets/buttons/svg cruft
- `scripts/curate_art.py` — pulls Lorenzo's own artwork from
  lorenzoscardicchio.com (curated allow-list; the old WordPress site is a Divi
  theme full of stock imagery, so only named originals survive)
- `content/art.json` — the artwork manifest (painting / design / photo / logo)

Re-run any script with `python3 scripts/<name>.py` to refresh content.

## Develop & deploy

```bash
npm run dev    # local dev on :3000
npm run build  # static production build
```

### Deployment

Live at **https://bambino-five.vercel.app** (Vercel project `bambino`, personal
scope `journeynudgers-projects`).

The GitHub repo is connected, so **pushing to `main` deploys to production
automatically** — no CLI step needed. To deploy by hand anyway:

```bash
npx vercel deploy --prod --scope journeynudgers-projects
```

Deployment Protection is off, so every deployment URL is publicly viewable —
both the `bambino-five.vercel.app` alias and the per-deploy preview URLs.
