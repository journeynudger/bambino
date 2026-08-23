import Link from "next/link";
import Checker from "@/components/checker";
import CollageCluster, { type ClusterPiece } from "@/components/collage-cluster";
import PaperPanel from "@/components/paper-panel";
import {
  artByCategory,
  formatDate,
  getAscii,
  getPostIndex,
  pick,
} from "@/lib/content";
import { pad2 } from "@/lib/typo";

export default function Cover() {
  const posts = getPostIndex();
  const total = posts.length;
  const ascii = getAscii();
  const paintings = pick(artByCategory("painting"), "cover", 3);
  const djPhoto = artByCategory("photo").find((a) => a.file.includes("bambino_dj"));

  const heroPieces: ClusterPiece[] = [];
  if (paintings[0]) {
    heroPieces.push({
      src: paintings[0].file,
      w: "min(26%, 330px)",
      left: "3%",
      top: "50%",
      rot: -2.5,
      z: 2,
    });
  }
  if (paintings[1]) {
    heroPieces.push({
      src: paintings[1].file,
      w: "min(22%, 280px)",
      right: "5%",
      top: "36%",
      rot: 2,
      z: 2,
    });
  }
  if (paintings[2]) {
    heroPieces.push({
      src: paintings[2].file,
      w: "min(14%, 190px)",
      left: "20%",
      top: "24%",
      rot: -1.2,
      z: 1,
      variant: "torn",
    });
  }
  if (djPhoto) {
    heroPieces.push({
      src: "/art/IMG_5663.jpg",
      w: "min(15%, 200px)",
      right: "18%",
      top: "58%",
      rot: 1.5,
      z: 1,
      variant: "dither",
      aspect: "3 / 4",
    });
  }

  return (
    <main>
      {/* ————— cover spread ————— */}
      <header className="relative h-[112svh]">
        <div
          data-fx-header
          className="sticky top-0 flex h-[100svh] flex-col overflow-hidden"
        >
          <div className="mono-label flex items-center justify-center gap-3 px-4 pt-5">
            <Checker />
            <span>[ A JOURNAL OF ESSAYS & ARTWORK ]</span>
            <Checker />
          </div>

          {/* collage */}
          <CollageCluster
            pieces={heroPieces}
            parallax
            className="pointer-events-none absolute inset-0 z-0"
          />

          {/* wordmark */}
          <div className="relative z-10 mx-auto mt-[14svh] w-full max-w-6xl px-4 text-center">
            <p className="font-display text-[clamp(1.4rem,3vw,2.4rem)] italic font-[360]">
              The Notebooks of
            </p>
            <h1 className="mx-auto mt-2 w-[min(680px,82vw)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/art/bambino-wordmark.png"
                alt="bambino"
                className="mx-auto w-full"
              />
            </h1>
            <p className="mono-label mt-2 text-ink-2/80">
              WORDS & ARTWORK BY LORENZO SCARDICCHIO
            </p>
          </div>

          <div className="mono-label absolute bottom-16 left-1/2 -translate-x-1/2 text-ink-2/70">
            SCROLL&nbsp;↓
          </div>
        </div>
      </header>

      {/* ————— preamble ————— */}
      <section className="relative z-10 mx-auto -mt-[16svh] mb-32 w-[min(820px,92vw)] sm:mr-[6vw] sm:ml-auto">
        <PaperPanel tint="green" className="px-7 py-9 sm:px-14 sm:py-12">
          <div className="mono-label flex items-start justify-between gap-6 pb-8">
            <span className="inline-flex items-center gap-3">
              <Checker />
              <span>
                CHAPTERS
                <br />
                {pad2(total)}
              </span>
            </span>
            <span className="text-right">
              OMNIA MEA MECUM PORTO
              <br />[ EST. MMXXV ]
            </span>
          </div>
          <pre className="ascii" aria-hidden>
            {ascii.preamble}
          </pre>
          <div className="prose-book mt-8 text-[1.05rem]">
            <p>
              Behind every feed refresh there is a design decision, and behind
              every design decision there is a wager about what a human being
              is. These notebooks collect essays on attention, technology, and
              the quiet work of becoming who you want to be — set among
              paintings and other things made by hand. Read them slowly.
              They were written that way.
            </p>
          </div>
        </PaperPanel>
      </section>

      {/* ————— table of chapters ————— */}
      <section className="mx-auto w-[min(980px,94vw)] pb-28">
        <div className="mono-label mb-6 flex items-center justify-between border-b border-ink-2 pb-3">
          <span className="inline-flex items-center gap-3">
            <Checker /> TABLE OF CHAPTERS
          </span>
          <span>READ IN ANY ORDER</span>
        </div>

        <nav>
          {posts.map((p, i) => {
            const n = total - i;
            return (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="toc-row group"
                data-fx-reveal
              >
                <span className="toc-num">{pad2(n)}</span>
                <span>
                  <span className="block font-display text-[clamp(1.35rem,2.6vw,1.9rem)] leading-tight font-[400]">
                    {p.title}
                  </span>
                  {p.subtitle && (
                    <span className="mt-1 block font-serif text-sm italic opacity-70">
                      {p.subtitle}
                    </span>
                  )}
                </span>
                <span className="mono-label text-right opacity-70">
                  {p.readMinutes}MIN READ
                  <br />
                  {formatDate(p.date)}
                </span>
              </Link>
            );
          })}
        </nav>
      </section>

      {/* ————— closing ————— */}
      <section className="night px-6 py-24">
        <div className="mx-auto flex w-[min(980px,94vw)] flex-col items-center gap-10">
          {djPhoto && (
            <div
              className="frame fig-hover relative w-[min(380px,70vw)]"
              data-fx-drift="30"
              data-rot="-1"
              style={{ transform: "rotate(-1deg)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={djPhoto.file} alt="Lorenzo at the decks" />
              <span className="fig-chip">
                <em>fig 00</em>—BAMBINO, LIVE
              </span>
            </div>
          )}
          <div className="mono-label flex w-full items-center justify-between text-paper/70">
            <Link href="/art" className="hover:text-paper">
              THE FIGURES →
            </Link>
            <Link href="/podcast" className="hover:text-paper">
              THE PODCAST →
            </Link>
            <Link href="/about" className="hover:text-paper">
              COLOPHON →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
