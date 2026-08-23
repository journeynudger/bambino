import Checker from "@/components/checker";
import { displayTitle } from "@/lib/typo";

export type CollagePiece = {
  src: string;
  /** css width, e.g. "34%" */
  w: string;
  /** css position */
  left?: string;
  right?: string;
  top: string;
  rot: number;
  ink?: boolean;
};

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
  pieces: CollagePiece[];
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
        <div
          data-fx-parallax
          className="pointer-events-none absolute inset-0 z-0"
        >
          {pieces.map((p, i) => (
            <div
              key={i}
              data-rot={p.rot}
              className={p.ink ? "absolute ink-invert" : "frame absolute"}
              style={{
                width: p.w,
                left: p.left,
                right: p.right,
                top: p.top,
                transform: `rotate(${p.rot}deg)`,
              }}
            >
              {/* collage prints are decorative */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="eager" />
            </div>
          ))}
        </div>

        {/* title */}
        <div className="relative z-10 mx-auto mt-[16svh] w-full max-w-5xl px-4 text-center sm:px-8">
          <h1
            className="font-display text-[clamp(2.6rem,8.5vw,7rem)] leading-[1.02] font-[380] tracking-[-0.015em]"
            style={{ fontVariationSettings: "'opsz' 144" }}
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
