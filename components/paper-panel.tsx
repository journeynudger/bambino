import { cn } from "@/lib/utils";

const TINTS = {
  pink: "#f0cdc9",
  green: "#c9ddbe",
  blue: "#c9d6e2",
} as const;

export type PanelTint = keyof typeof TINTS;

/**
 * A sheet of tinted paper that ROLLS UP as the page scrolls past it, the way
 * the Almanack's preambles do: the sheet pins at the top of the viewport, its
 * foot retreats upward at scroll speed behind a rolled edge, and the page
 * slides up underneath. ScrollFX drives --rolled (0 = flat, 1 = rolled away)
 * and gives the wrapper the scroll room; without scripts the sheet simply
 * sits in the page with its roll at the foot.
 */
export default function PaperPanel({
  tint = "pink",
  className,
  children,
}: {
  tint?: PanelTint;
  className?: string;
  children: React.ReactNode;
}) {
  const color = TINTS[tint];
  return (
    <div
      data-fx-rollup
      className="rollup"
      style={{ "--panel-tint": color } as React.CSSProperties}
    >
      <div className="rollup-pin">
        <div className={cn("rollup-sheet", className)} style={{ background: color }}>
          {children}
        </div>
        <div className="rollup-roll" aria-hidden />
      </div>
    </div>
  );
}
