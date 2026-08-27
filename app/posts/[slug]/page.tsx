import { Fragment } from "react";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Checker from "@/components/checker";
import ChapterHeader, { type CollagePiece } from "@/components/chapter-header";
import PaperPanel, { type PanelTint } from "@/components/paper-panel";
import PrevNext from "@/components/prev-next";
import ReadingControls from "@/components/reading-controls";
import ShareRow from "@/components/share-row";
import {
  artByCategory,
  chapterNumber,
  formatDate,
  getAdjacent,
  getAscii,
  getPost,
  pick,
} from "@/lib/content";
import { numberWord } from "@/lib/numbers";
import { pad2 } from "@/lib/typo";

export const dynamicParams = false;

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "content", "posts");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => ({ slug: f.replace(/\.json$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return {
    title: `${post.title} — bambino`,
    description: post.subtitle || post.description,
  };
}

const TINTS: PanelTint[] = ["pink", "green", "blue"];

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const n = chapterNumber(slug);
  const { prev, next } = getAdjacent(slug);
  const ascii = getAscii();
  const tint = TINTS[n % TINTS.length];

  const paintings = pick(artByCategory("painting"), slug + "p", 2);
  const designs = pick(artByCategory("design"), slug + "d", 2);

  const pieces: CollagePiece[] = [];
  if (n % 2 === 0) {
    if (post.leadImage) {
      pieces.push({
        src: post.leadImage,
        w: "min(32%, 440px)",
        left: "6%",
        top: "40%",
        rot: -2.5,
        z: 2,
        figNo: `fig ${pad2(n)}`,
      });
    }
    if (paintings[0]) {
      pieces.push({
        src: paintings[0].file,
        w: "min(20%, 280px)",
        left: "27%",
        top: "55%",
        rot: 2,
        z: 3,
      });
    }
    if (designs[0]) {
      pieces.push({
        src: designs[0].file,
        w: "min(15%, 210px)",
        left: "22%",
        top: "27%",
        rot: -1.2,
        z: 1,
        variant: "torn",
      });
    }
    if (paintings[1]) {
      pieces.push({
        src: paintings[1].file,
        w: "min(18%, 250px)",
        left: "35%",
        top: "52%",
        rot: 1.5,
        z: 1,
        variant: "dither",
        aspect: "4 / 3",
      });
    }
  } else {
    if (post.leadImage) {
      pieces.push({
        src: post.leadImage,
        w: "min(32%, 440px)",
        right: "6%",
        top: "40%",
        rot: 2.5,
        z: 2,
        figNo: `fig ${pad2(n)}`,
      });
    }
    if (paintings[0]) {
      pieces.push({
        src: paintings[0].file,
        w: "min(20%, 280px)",
        right: "26%",
        top: "56%",
        rot: -2,
        z: 3,
      });
    }
    if (designs[0]) {
      pieces.push({
        src: designs[0].file,
        w: "min(15%, 210px)",
        right: "23%",
        top: "28%",
        rot: 1.2,
        z: 1,
        variant: "torn",
      });
    }
    if (paintings[1]) {
      pieces.push({
        src: paintings[1].file,
        w: "min(18%, 250px)",
        right: "35%",
        top: "52%",
        rot: -1.5,
        z: 1,
        variant: "dither",
        aspect: "4 / 3",
      });
    }
  }

  const runningHead = `CH. ${n} // ${post.title.toUpperCase()}`;

  let figCount = 0;
  let bandRun = 0;
  const spreads = post.sections.map((section, i) => {
    const textLen = section.html.replace(/<[^>]+>/g, "").trim().length;
    const hasProse = textLen > 0;
    const prose = hasProse ? (
      <div
        className="prose-book"
        dangerouslySetInnerHTML={{ __html: section.html }}
      />
    ) : null;

    if (!section.figure) {
      if (!prose) return null;
      return (
        <section key={i} className="mx-auto w-[min(720px,92vw)] py-16">
          {prose}
        </section>
      );
    }

    figCount += 1;
    const m = figCount;
    // reader-first cadence: the text keeps one home side per chapter, the
    // full-width band lands as punctuation, the mirrored spread appears once
    // per cycle. Very short passages take the band rather than sit sparse
    // beside a tall figure — but never more than two bands in a row, so
    // image-heavy chapters keep a spread rhythm instead of a wall of plates.
    const homeSide = n % 2 === 0 ? 0 : 1;
    const cadence = n % 2 === 0 ? [0, 2, 0, 1] : [1, 2, 1, 0];
    let variant = !prose || textLen < 220 ? 2 : cadence[(m - 1) % 4];
    if (variant === 2 && bandRun >= 2) variant = homeSide;
    bandRun = variant === 2 ? bandRun + 1 : 0;
    const cap =
      section.figure.caption?.toUpperCase() ??
      (i === 0 ? post.title.toUpperCase() : null);

    // reference prints sit square — clean lines, no rotation in the spreads
    const crossing = i > 0;
    const figure = (
      <>
        <div className="figlabel lg:hidden">
          <em>
            fig {n}.{m}
          </em>
          {cap && <> — {cap}</>}
        </div>
        <div className="frame fig-hover relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={section.figure.src}
            alt={section.figure.caption ?? post.title}
            className={
              variant === 2
                ? "h-auto max-h-[70svh] w-full object-cover"
                : "h-auto w-full"
            }
          />
          <span className="fig-chip">
            <em>
              fig {n}.{m}
            </em>
            {cap && <>—{cap}</>}
          </span>
        </div>
      </>
    );

    if (variant === 0) {
      return (
        <section
          key={i}
          className="mx-auto grid w-[min(1300px,94vw)] grid-cols-1 gap-10 py-16 lg:grid-cols-[0.9fr_1px_1.1fr] lg:gap-14"
        >
          <div>
            <div
              className={`lg:sticky lg:top-24${crossing ? " relative z-[1] lg:-mt-28" : ""}`}
            >
              {figure}
            </div>
          </div>
          <div className="gutter-rule hidden lg:block" />
          <div>{prose}</div>
        </section>
      );
    }

    if (variant === 1) {
      return (
        <section
          key={i}
          className="mx-auto grid w-[min(1300px,94vw)] grid-cols-1 gap-10 py-16 lg:grid-cols-[1.1fr_1px_0.9fr] lg:gap-14"
        >
          <div>{prose}</div>
          <div className="gutter-rule hidden lg:block" />
          <div className="order-first lg:order-none">
            <div
              className={`lg:sticky lg:top-24${crossing ? " relative z-[1] lg:-mt-28" : ""}`}
            >
              {figure}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section key={i} className="mx-auto w-[min(1100px,94vw)] py-16">
        <div className={crossing ? "relative z-[1] lg:-mt-28" : undefined}>
          {figure}
        </div>
        {prose && (
          <div className="mx-auto mt-12 w-[min(720px,100%)]">{prose}</div>
        )}
      </section>
    );
  });

  return (
    <main>
      {/* the opaque page sheet — scrolls up and away, revealing the pinned spread */}
      <div className="paper-sheet paper-sheet--lifting relative z-[1] pb-10">
        <ChapterHeader
          kicker={`[ CHAPTER ${numberWord(n)} ]`}
          title={post.title}
          runningHead={runningHead}
          pieces={pieces}
        />

        {/* preamble scroll */}
        <section className="relative z-10 mx-auto -mt-[14svh] mb-28 w-[min(860px,92vw)] sm:ml-auto sm:mr-[4vw]">
          <PaperPanel tint={tint} className="px-7 py-9 sm:px-14 sm:py-12">
            <div className="mono-label flex items-start justify-between gap-6 pb-8">
              <span className="inline-flex items-center gap-3">
                <Checker />
                <span>
                  READ
                  <br />
                  {post.readMinutes}MIN
                </span>
              </span>
              <span className="text-right">
                {formatDate(post.date)}
                <br />[ FROM THE NOTEBOOK ]
              </span>
            </div>
            <pre className="ascii" aria-hidden>
              {ascii.preamble}
            </pre>
            <div className="prose-book mt-8 text-[1.05rem]">
              <p>{post.subtitle || post.description}</p>
            </div>
          </PaperPanel>
        </section>

        {/* running head */}
        <div className="mx-auto w-[min(1300px,94vw)] pt-14 lg:pt-0">
          <div className="mono-label flex items-center justify-between gap-4 border-b border-dotted border-ink-2/40 pb-3">
            <span className="inline-flex items-center gap-3">
              <Checker />
              CH. {n} // <span className="underline underline-offset-4">{post.title.toUpperCase()}</span>
            </span>
            <span className="hidden sm:inline">BY LORENZO SCARDICCHIO</span>
          </div>

          <div className="mt-10">
            <ReadingControls />
          </div>
        </div>

        {/* chapter title */}
        <div className="mx-auto w-[min(720px,92vw)]">
          <h2
            className="mt-12 mb-16 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] font-[400]"
            data-fx-reveal
          >
            {post.title}
          </h2>
        </div>

        {/* spreads, divided by full-bleed hairlines the figures straddle */}
        {post.sections.length > 0 ? (
          spreads.filter(Boolean).map((node, k) => (
            <Fragment key={`spread-${k}`}>
              {k > 0 && (
                <div
                  aria-hidden
                  className="w-full border-t border-dotted border-ink-2/40 lg:border-solid lg:border-ink-2/20"
                />
              )}
              {node}
            </Fragment>
          ))
        ) : (
          <section className="mx-auto mb-24 w-[min(720px,92vw)]">
            <div
              className="prose-book"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </section>
        )}

        {/* fin */}
        <section className="mx-auto w-[min(720px,92vw)] pb-32">
          <div className="flex justify-center">
            <pre className="ascii ascii-sm text-ink-2/80" aria-hidden>
              {ascii.fin}
            </pre>
          </div>

          <div className="mt-10">
            <div className="mono-label mb-4 text-center">SHARE THIS CHAPTER</div>
            <ShareRow title={post.title} />
          </div>

          <div className="mono-label mt-6 text-center text-ink-2/60">
            FIRST PUBLISHED ON{" "}
            <a href={post.canonical} target="_blank" rel="noreferrer">
              SUBSTACK
            </a>{" "}
            — {formatDate(post.date)}
          </div>
        </section>
      </div>

      <PrevNext
        prev={prev}
        next={next}
        prevChapter={prev ? chapterNumber(prev.slug) : null}
        nextChapter={next ? chapterNumber(next.slug) : null}
      />
    </main>
  );
}
