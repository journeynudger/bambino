import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Checker from "@/components/checker";
import ChapterHeader, { type CollagePiece } from "@/components/chapter-header";
import PaperPanel, { type PanelTint } from "@/components/paper-panel";
import PrevNext from "@/components/prev-next";
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

  const paintings = pick(artByCategory("painting"), slug + "p", 1);
  const designs = pick(artByCategory("design"), slug + "d", 2);

  const pieces: CollagePiece[] = [];
  if (post.leadImage) {
    pieces.push({
      src: post.leadImage,
      w: "min(34%, 460px)",
      left: "6%",
      top: "38%",
      rot: -3,
    });
  }
  if (paintings[0]) {
    pieces.push({
      src: paintings[0].file,
      w: "min(22%, 300px)",
      right: "7%",
      top: "52%",
      rot: 2.5,
    });
  }
  if (designs[0]) {
    pieces.push({
      src: designs[0].file,
      w: "min(13%, 180px)",
      left: "10%",
      top: "8%",
      rot: -1.8,
    });
  }

  const runningHead = `CH. ${n} // ${post.title.toUpperCase()}`;

  return (
    <main>
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

      {/* book spread */}
      <section className="mx-auto grid w-[min(1300px,94vw)] grid-cols-1 gap-10 pb-32 lg:grid-cols-[0.9fr_1px_1.1fr] lg:gap-14">
        {/* figures column */}
        <aside className="relative hidden lg:block">
          <div className="sticky top-14 flex flex-col gap-14 pb-10">
            {post.leadImage && (
              <div className="frame" data-fx-drift="26" data-rot="-1.6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.leadImage} alt={post.title} />
                <div className="mono-label pt-2 text-[0.62rem] text-ink-2/70">
                  fig {pad2(n)} — {post.title.toUpperCase()}
                </div>
              </div>
            )}
            {designs[1] && (
              <div
                className="frame w-2/3 self-end"
                data-fx-drift="52"
                data-rot="1.2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={designs[1].file} alt="" />
              </div>
            )}
          </div>
        </aside>

        <div className="gutter-rule hidden lg:block" />

        {/* text column */}
        <article>
          <div className="mono-label flex items-center justify-between gap-4 border-b border-dotted border-ink-2/40 pb-3">
            <span className="inline-flex items-center gap-3">
              <Checker />
              CH. {n} // <span className="underline underline-offset-4">{post.title.toUpperCase()}</span>
            </span>
            <span className="hidden sm:inline">BY LORENZO SCARDICCHIO</span>
          </div>

          {/* mobile cover */}
          {post.leadImage && (
            <div className="frame mt-8 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.leadImage} alt={post.title} />
            </div>
          )}

          <h2
            className="mt-12 mb-10 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] font-[380]"
            style={{ fontVariationSettings: "'opsz' 100" }}
            data-fx-reveal
          >
            {post.title}
          </h2>

          <div
            className="prose-book"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />

          <div className="mt-20 flex justify-center">
            <pre className="ascii text-ink-2/80" aria-hidden>
              {ascii.fin}
            </pre>
          </div>
          <div className="mono-label mt-6 text-center text-ink-2/60">
            FIRST PUBLISHED ON{" "}
            <a href={post.canonical} target="_blank" rel="noreferrer">
              SUBSTACK
            </a>{" "}
            — {formatDate(post.date)}
          </div>
        </article>
      </section>

      <PrevNext
        prev={prev}
        next={next}
        prevChapter={prev ? chapterNumber(prev.slug) : null}
        nextChapter={next ? chapterNumber(next.slug) : null}
      />
    </main>
  );
}
