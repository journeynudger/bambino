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
  blurb: string;
  url: string;
  thumb: string | null;
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
  const episodes = [...podcast.episodes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featured = episodes[0];
  const rest = episodes.slice(1);

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
          {podcast.platforms.map((p) =>
            p.url ? (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="mono-label rounded-full border border-ink-2 px-5 py-2 !no-underline transition-colors hover:bg-ink-2 hover:text-paper"
              >
                {p.name} ↗
              </a>
            ) : (
              <span
                key={p.name}
                className="mono-label rounded-full border border-ink-2 px-5 py-2 opacity-40"
              >
                {p.name} ↗
              </span>
            )
          )}
        </div>
      </section>

      {episodes.length > 0 ? (
        <section className="mx-auto w-[min(1100px,94vw)]">
          {/* featured — latest episode */}
          <div className="mt-10 border-t border-dotted border-ink-2/40 pt-10">
            <a
              href={featured.url}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-1 sm:grid-cols-[minmax(200px,320px)_1fr] gap-8 items-start"
              data-fx-reveal
            >
              {featured.thumb ? (
                <div className="frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="aspect-video w-full object-cover"
                    src={featured.thumb}
                    alt={featured.title}
                  />
                </div>
              ) : (
                <div />
              )}
              <div>
                <div className="mono-label">
                  LATEST EPISODE • EP {pad2(featured.ep)} •{" "}
                  {formatDate(featured.date)}
                </div>
                <h2 className="mt-4 font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-[400] group-hover:underline">
                  {featured.title}
                </h2>
                <p className="mt-4 font-serif opacity-80 max-w-[65ch]">
                  {featured.blurb}
                </p>
              </div>
            </a>
          </div>

          {/* older episodes */}
          {rest.length > 0 && (
            <nav className="mt-10 border-t border-dotted border-ink-2/40">
              {rest.map((e) => (
                <a
                  key={e.ep}
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[120px_1fr] gap-6 py-6 items-start border-b border-dotted border-ink-2/40"
                  data-fx-reveal
                >
                  {e.thumb ? (
                    <div className="frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="aspect-video w-full object-cover"
                        src={e.thumb}
                        alt={e.title}
                      />
                    </div>
                  ) : (
                    <div />
                  )}
                  <span>
                    <span className="mono-label block">
                      EP {pad2(e.ep)} • {formatDate(e.date)}
                    </span>
                    <span className="mt-1 block font-display text-[1.3rem] leading-tight font-[400] group-hover:underline">
                      {e.title}
                    </span>
                    <span className="mt-1 block font-serif text-sm opacity-70 line-clamp-2">
                      {e.blurb}
                    </span>
                  </span>
                </a>
              ))}
            </nav>
          )}
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
