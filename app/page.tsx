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

  return (
    <main>
      {/* the opaque page sheet — scrolls up and away, revealing the pinned spread */}
      <div className="paper-sheet paper-sheet--lifting relative z-[1] pb-10">
        {/* ————— cover spread ————— */}
        <header className="relative h-[112svh]">
          <div
            data-fx-header
            className="sticky top-0 flex h-[100svh] flex-col overflow-hidden"
          >
            <div className="mono-label flex items-center justify-center gap-3 px-4 pt-16 lg:pt-5">
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

        {/* ————— the newsletter ————— */}
        <section className="mx-auto w-[min(1100px,94vw)] pb-28">
          <div className="mono-label flex items-center justify-between border-b border-ink-2 pb-3">
            <span className="inline-flex items-center gap-3">
              <Checker /> THE NEWSLETTER
            </span>
            <span>READ IN ANY ORDER</span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_1fr]">
            {posts[0] && (
              <Link
                href={`/posts/${posts[0].slug}`}
                className="group block"
                data-fx-reveal
              >
                {posts[0].cover && (
                  <div className="frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posts[0].cover}
                      alt={posts[0].title}
                      className="w-full"
                    />
                  </div>
                )}
                <p className="mono-label mt-6">
                  CH. {pad2(total)} • {formatDate(posts[0].date)} •{" "}
                  {posts[0].readMinutes}MIN READ
                </p>
                <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] font-[400] decoration-1 underline-offset-4 group-hover:underline">
                  {posts[0].title}
                </h2>
                {posts[0].subtitle && (
                  <p className="mt-3 font-serif italic opacity-70">
                    {posts[0].subtitle}
                  </p>
                )}
                {posts[0].description &&
                  posts[0].description !== posts[0].subtitle && (
                    <p className="mt-4 max-w-[60ch] font-serif text-[0.98rem] opacity-80">
                      {posts[0].description}
                    </p>
                  )}
              </Link>
            )}

            <div>
              {posts.slice(1).map((p, i) => {
                const n = total - 1 - i;
                return (
                  <Link
                    key={p.slug}
                    href={`/posts/${p.slug}`}
                    className="group grid grid-cols-[96px_1fr] items-start gap-5 border-b border-dotted border-ink-2/40 py-5"
                    data-fx-reveal
                  >
                    {p.cover && (
                      <div className="frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.cover}
                          alt={p.title}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </div>
                    )}
                    <span>
                      <span className="mono-label block opacity-70">
                        CH. {pad2(n)} • {formatDate(p.date)} • {p.readMinutes}
                        MIN
                      </span>
                      <span className="mt-1 block font-display text-[1.35rem] leading-tight font-[400] group-hover:underline">
                        {p.title}
                      </span>
                      {p.subtitle && (
                        <span className="mt-1 line-clamp-2 block font-serif text-sm italic opacity-70">
                          {p.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ————— closing: pinned under the page sheet ————— */}
      <div className="relative">
        {/* spacer: creates the scroll room; must NOT block clicks on the layer beneath */}
        <div data-fx-footer className="pointer-events-none h-[70svh]" aria-hidden />
        {/* pinned under-layer */}
        <div className="fixed inset-x-0 bottom-0 h-[70svh]">
          <div data-footer-inner className="h-full will-change-transform">
            <section className="night h-full px-6 py-24">
              <div className="mx-auto flex w-[min(980px,94vw)] flex-col items-center gap-10">
                <pre className="ascii ascii-sm text-paper/70" aria-hidden>
                  {ascii.fin}
                </pre>
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
          </div>
        </div>
      </div>
    </main>
  );
}
