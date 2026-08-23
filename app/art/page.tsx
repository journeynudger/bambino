import type { Metadata } from "next";
import Checker from "@/components/checker";
import { getArt, type Artwork } from "@/lib/content";
import { pad2 } from "@/lib/typo";

export const metadata: Metadata = {
  title: "The Figures — bambino",
  description: "Paintings, designs, and photographs by Lorenzo Scardicchio.",
};

function prettyTitle(t: string): string {
  return t
    .replace(/&#\d+;/g, "")
    .replace(/bambino_/i, "")
    .replace(/IMG_?/i, "PLATE ")
    .replace(/[_-]+/g, " ")
    .trim()
    .toUpperCase();
}

function Fig({ art, n }: { art: Artwork; n: number }) {
  return (
    <figure className="frame mb-8 break-inside-avoid" data-fx-reveal>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.file} alt={art.title} className="block w-full" />
      <figcaption className="mono-label pt-2 text-[0.62rem] text-ink-2/70">
        fig {pad2(n)} — {prettyTitle(art.title)}
      </figcaption>
    </figure>
  );
}

export default function ArtPage() {
  const art = getArt();
  const paintings = art.filter((a) => a.category === "painting");
  const designs = art.filter((a) => a.category === "design");
  const photos = art.filter((a) => a.category === "photo");
  let n = 0;

  return (
    <main className="pb-28">
      <header className="mx-auto w-[min(1100px,94vw)] pt-6">
        <div className="mono-label flex items-center justify-between border-b border-ink-2 pb-3">
          <span className="inline-flex items-center gap-3">
            <Checker /> [ THE FIGURES ]
          </span>
          <span>PLATES & PICTURES</span>
        </div>
        <h1
          className="mt-14 mb-16 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.95] font-[380]"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          The <em>Figures</em>
        </h1>
      </header>

      <section className="mx-auto w-[min(1100px,94vw)]">
        <div className="mono-label mb-8 border-b border-dotted border-ink-2/40 pb-2">
          I. PAINTINGS
        </div>
        <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
          {paintings.map((a) => (
            <Fig key={a.file} art={a} n={++n} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-[min(1100px,94vw)]">
        <div className="mono-label mb-8 border-b border-dotted border-ink-2/40 pb-2">
          II. DESIGN WORK
        </div>
        <div className="columns-2 gap-8 lg:columns-3">
          {designs.map((a) => (
            <Fig key={a.file} art={a} n={++n} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-[min(1100px,94vw)]">
        <div className="mono-label mb-8 border-b border-dotted border-ink-2/40 pb-2">
          III. PHOTOGRAPHS
        </div>
        <div className="columns-2 gap-8 lg:columns-3">
          {photos.map((a) => (
            <Fig key={a.file} art={a} n={++n} />
          ))}
        </div>
      </section>
    </main>
  );
}
