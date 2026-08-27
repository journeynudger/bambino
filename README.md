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
| `data-fx-unroll` | parchment panel unrolls — the roll cylinder travels down, clip-path reveals content (`--unroll` 0→1) |
| `data-fx-reveal` | cosine-eased fade/rise on entering the viewport |
| `data-fx-drift` | gentle positional parallax for sticky figures |
| `data-progress` | reading-progress percentage in the bottom bar |

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
