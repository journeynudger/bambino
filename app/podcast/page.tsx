import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import Checker from "@/components/checker";
import PaperPanel from "@/components/paper-panel";
import { formatDate } from "@/lib/content";
import { pad2 } from "@/lib/typo";

export const metadata: Metadata = {
  title: "The Podcast — bambino",
  description:
    "Conversations on attention, technology, and the quiet work of becoming who you want to be.",
};

type Platform = { name: string; url: string };

type Episode = {
  ep: number;
  title: string;
  date: string;
  duration: string;
  blurb: string;
  url: string;
};

type PodcastContent = {
  tagline: string;
  platforms: Platform[];
  episodes: Episode[];
};

function getPodcast(): PodcastContent {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "content", "podcast.json"),
    "utf8"
  );
  return JSON.parse(raw) as PodcastContent;
}

export default function PodcastPage() {
  const podcast = getPodcast();
  const live = podcast.platforms.filter((p) => p.url);
  const hasLinks = live.length > 0;

  return (
    <main className="pb-28">
      <header className="mx-auto w-[min(1100px,94vw)] pt-6">
        <div className="mono-label flex items-center justify-between border-b border-ink-2 pb-3">
          <span className="inline-flex items-center gap-3">
            <Checker /> [ THE PODCAST ]
          </span>
          <span>LISTEN IN ANY ORDER</span>
        </div>
        <h1
          className="mt-14 mb-16 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.95] font-[380]"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          The <em>Podcast</em>
        </h1>
      </header>

      <section className="mx-auto w-[min(1100px,94vw)]">
        <div className="prose-book w-[min(620px,100%)] text-[1.05rem]">
          <p>{podcast.tagline}</p>
        </div>

        {/* platform row */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          {hasLinks
            ? live.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mono-label rounded-full border border-ink-2 px-5 py-2 !no-underline transition-colors hover:bg-ink-2 hover:text-paper"
                >
                  {p.name} ↗
                </a>
              ))
            : podcast.platforms.map((p) => (
                <span
                  key={p.name}
                  className="mono-label rounded-full border border-ink-2 px-5 py-2 opacity-50"
                >
                  {p.name} ↗
                </span>
              ))}
        </div>
        {!hasLinks && (
          <div className="mono-label mt-4 text-ink-2/60">
            PLATFORM LINKS COMING SOON
          </div>
        )}
      </section>

      {podcast.episodes.length > 0 ? (
        <section className="mx-auto mt-20 w-[min(980px,94vw)]">
          <div className="mono-label mb-6 flex items-center justify-between border-b border-ink-2 pb-3">
            <span className="inline-flex items-center gap-3">
              <Checker /> THE EPISODES
            </span>
            <span>{pad2(podcast.episodes.length)} RECORDED</span>
          </div>
          <nav>
            {podcast.episodes.map((e) => (
              <a
                key={e.ep}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="toc-row group"
                data-fx-reveal
              >
                <span className="toc-num">{pad2(e.ep)}</span>
                <span>
                  <span className="block font-display text-[clamp(1.35rem,2.6vw,1.9rem)] leading-tight font-[400]">
                    {e.title}
                  </span>
                  {e.blurb && (
                    <span className="mt-1 block font-serif text-sm italic opacity-70">
                      {e.blurb}
                    </span>
                  )}
                </span>
                <span className="mono-label text-right opacity-70">
                  {e.duration}
                  <br />
                  {formatDate(e.date)}
                </span>
              </a>
            ))}
          </nav>
        </section>
      ) : (
        <section className="mx-auto mt-20 w-[min(820px,92vw)]">
          <PaperPanel tint="pink" className="px-7 py-9 sm:px-14 sm:py-12">
            <div className="mono-label flex items-start justify-between gap-6 pb-8">
              <span className="inline-flex items-center gap-3">
                <Checker /> EPISODE 001
              </span>
              <span className="text-right">[ IN THE WORKS ]</span>
            </div>
            <div className="prose-book text-[1.05rem]">
              <p>
                We&rsquo;re just getting started. The first conversations are
                being recorded now — they&rsquo;ll appear here, and on the
                platforms above, the moment they&rsquo;re ready.
              </p>
            </div>
          </PaperPanel>
        </section>
      )}

      <div className="mono-label mt-24 text-center">
        <Link href="/" className="hover:opacity-70">
          ← BACK TO THE COVER
        </Link>
      </div>
    </main>
  );
}
