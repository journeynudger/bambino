import Checker from "@/components/checker";
import CollageCluster, { type ClusterPiece } from "@/components/collage-cluster";
import { displayTitle } from "@/lib/typo";

export type { ClusterPiece as CollagePiece } from "@/components/collage-cluster";

/**
 * Full-viewport chapter opening: mono running head, giant display title,
 * scattered prints that parallax upward while the whole header blurs out.
 */
export default function ChapterHeader({
  kicker,
  title,
  runningHead,
  byline = "BY LORENZO SCARDICCHIO",
  pieces,
}: {
  kicker: string;
  title: string;
  runningHead: string;
  byline?: string;
  pieces: ClusterPiece[];
}) {
  return (
    <header className="relative h-[108svh]">
      <div
        data-fx-header
        className="sticky top-0 flex h-[100svh] flex-col overflow-hidden"
      >
        {/* running head */}
        <div className="mono-label flex items-center justify-between gap-4 px-4 pt-4 sm:px-8">
          <span className="inline-flex items-center gap-3">
            <Checker />
            <span className="hidden sm:inline">{kicker}</span>
            <Checker className="sm:hidden" />
          </span>
          <span className="truncate underline decoration-1 underline-offset-4">
            {runningHead}
          </span>
          <span className="hidden text-right sm:block">{byline}</span>
        </div>

        {/* collage */}
        <CollageCluster pieces={pieces} parallax />

        {/* title */}
        <div className="relative z-10 mx-auto mt-[16svh] w-full max-w-5xl px-4 text-center sm:px-8">
          <h1
            className="font-display text-[clamp(2.6rem,8.5vw,7rem)] leading-[1.02] font-[400] tracking-[-0.015em]"
          >
            {displayTitle(title)}
          </h1>
        </div>

        {/* scroll cue */}
        <div className="mono-label absolute bottom-16 left-1/2 -translate-x-1/2 text-ink-2/70">
          SCROLL&nbsp;↓
        </div>
      </div>
    </header>
  );
}
