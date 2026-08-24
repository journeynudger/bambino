import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { pad2 } from "@/lib/typo";

/** The dark end-of-chapter spread: Previous / Next Chapter.
 *  Pinned under the page — the paper sheet scrolls up and away like a
 *  lifting curtain, revealing this layer beneath. */
export default function PrevNext({
  prev,
  next,
  prevChapter,
  nextChapter,
}: {
  prev: PostMeta | null;
  next: PostMeta | null;
  prevChapter: number | null;
  nextChapter: number | null;
}) {
  return (
    <div className="relative">
      {/* spacer: creates the scroll room; must NOT block clicks on the layer beneath */}
      <div data-fx-footer className="pointer-events-none h-[88svh]" aria-hidden />
      {/* pinned under-layer */}
      <div className="fixed inset-x-0 bottom-0 h-[88svh]">
        <div data-footer-inner className="h-full will-change-transform">
          <section className="night grid h-full grid-cols-1 sm:grid-cols-2">
            <div className="relative flex flex-col justify-between border-b border-dotted border-paper/30 p-6 sm:border-b-0 sm:border-r sm:p-10">
              {prev ? (
                <Link href={`/posts/${prev.slug}`} className="group flex h-full flex-col justify-between gap-16">
                  <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-[380]">
                    Previous
                    <br />
                    <em>Chapter</em>
                  </h2>
                  <div>
                    <div className="mono-label text-paper/70">
                      CHAPTER {prevChapter !== null ? pad2(prevChapter) : ""}
                      <br />
                      <span className="text-paper group-hover:underline">
                        {prev.title.toUpperCase()}
                      </span>
                    </div>
                    <div className="mono-label mt-4 text-paper/70">
                      {prev.readMinutes}MIN READ
                    </div>
                  </div>
                </Link>
              ) : (
                <Link href="/" className="group flex h-full flex-col justify-between gap-16">
                  <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-[380]">
                    Back to
                    <br />
                    <em>Cover</em>
                  </h2>
                  <div className="mono-label text-paper/70">
                    BAMBINO — <span className="group-hover:underline">THE COVER</span>
                  </div>
                </Link>
              )}
            </div>

            <div className="relative flex flex-col justify-between p-6 sm:p-10">
              {next ? (
                <Link
                  href={`/posts/${next.slug}`}
                  className="group flex h-full flex-col justify-between gap-16"
                >
                  <div className="mono-label text-paper/70">
                    CHAPTER {nextChapter !== null ? pad2(nextChapter) : ""}
                    <br />
                    <span className="text-paper group-hover:underline">
                      {next.title.toUpperCase()}
                    </span>
                    <span className="float-right hidden sm:block">
                      {next.readMinutes}MIN READ
                    </span>
                  </div>
                  <h2 className="self-end text-right font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-[380]">
                    Next
                    <br />
                    <em>Chapter</em>
                  </h2>
                </Link>
              ) : (
                <Link href="/art" className="group flex h-full flex-col justify-between gap-16">
                  <div className="mono-label text-paper/70">
                    THE END — <span className="group-hover:underline">SEE THE FIGURES</span>
                  </div>
                  <h2 className="self-end text-right font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] font-[380]">
                    The
                    <br />
                    <em>Figures</em>
                  </h2>
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
