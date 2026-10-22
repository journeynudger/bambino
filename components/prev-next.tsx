import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { pad2 } from "@/lib/typo";

/**
 * The end-of-chapter spread, to the Almanack's measurements: two columns on
 * #0d0e14, "Previous / Chapter" at 146px top-left, "Next / Chapter" bottom-
 * right on a light panel, mono captions in the corners. Pinned under the
 * page, which scrolls up and away like a lifting curtain to reveal it.
 */
const DISPLAY = "font-display text-[clamp(4rem,10.1vw,9.1rem)] leading-[0.84] font-[300] tracking-[-0.01em]";
const CAPTION = "font-mono text-[0.8rem] uppercase leading-[1.45] tracking-[0.02em]";

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
          <section className="night grid h-full grid-cols-1 bg-[#0d0e14] text-[#efefef] sm:grid-cols-2">
            {/* previous: dark */}
            <div className="relative flex flex-col justify-between border-b border-dotted border-[#efefef]/35 px-5 pt-6 pb-12 sm:border-r sm:border-b-0 sm:px-6 sm:pt-7">
              {prev ? (
                <Link href={`/posts/${prev.slug}`} className="group flex h-full flex-col justify-between gap-16">
                  <h2 className={DISPLAY}>
                    Previous
                    <br />
                    <em>Chapter</em>
                  </h2>
                  <div className={`${CAPTION} flex items-end justify-between gap-8`}>
                    <span>
                      CHAPTER {prevChapter !== null ? pad2(prevChapter) : ""}
                      <br />
                      <span className="group-hover:underline">{prev.title.toUpperCase()}</span>
                    </span>
                    <span className="whitespace-nowrap">{prev.readMinutes}MIN READ</span>
                  </div>
                </Link>
              ) : (
                <Link href="/" className="group flex h-full flex-col justify-between gap-16">
                  <h2 className={DISPLAY}>
                    Back to
                    <br />
                    <em>Cover</em>
                  </h2>
                  <div className={CAPTION}>
                    LORENZO SCARDICCHIO
                    <br />
                    <span className="group-hover:underline">THE COVER</span>
                  </div>
                </Link>
              )}
            </div>

            {/* next: light */}
            <div className="relative flex flex-col justify-between bg-[#cfcfcf] px-5 pt-6 pb-12 text-[#0d0e14] sm:px-6 sm:pt-7">
              {next ? (
                <Link href={`/posts/${next.slug}`} className="group flex h-full flex-col justify-between gap-16">
                  <div className={`${CAPTION} flex items-start justify-between gap-8`}>
                    <span>
                      CHAPTER {nextChapter !== null ? pad2(nextChapter) : ""}
                      <br />
                      <span className="group-hover:underline">{next.title.toUpperCase()}</span>
                    </span>
                    <span className="whitespace-nowrap">{next.readMinutes}MIN READ</span>
                  </div>
                  <h2 className={`${DISPLAY} self-end text-right`}>
                    Next
                    <br />
                    <em>Chapter</em>
                  </h2>
                </Link>
              ) : (
                <Link href="/gallery" className="group flex h-full flex-col justify-between gap-16">
                  <div className={CAPTION}>
                    THE END
                    <br />
                    <span className="group-hover:underline">THE PAINTINGS, ON THE WALL</span>
                  </div>
                  <h2 className={`${DISPLAY} self-end text-right`}>
                    The
                    <br />
                    <em>Gallery</em>
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
