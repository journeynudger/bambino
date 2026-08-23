import DitherImage from "@/components/dither-image";
import { cn } from "@/lib/utils";

export type ClusterPiece = {
  src: string;
  alt?: string;
  /** css width, e.g. "min(30%, 400px)" */
  w: string;
  /** css position */
  left?: string;
  right?: string;
  top: string;
  rot: number;
  z?: number;
  /** default "frame" */
  variant?: "frame" | "torn" | "plain" | "dither";
  /** mono part of the chip (after the em dash) */
  caption?: string;
  /** italic serif part of the chip, e.g. "fig 12" */
  figNo?: string;
  /** for dither variant, e.g. "4 / 3" */
  aspect?: string;
};

const variantClass = {
  frame: "frame absolute",
  torn: "torn absolute",
  plain: "absolute",
  dither: "absolute",
} as const;

/**
 * Overlapping archival collage — prints scattered on a desk. Each piece is a
 * direct child of the wrapper so the parallax engine can translate it and read
 * its data-rot for rotation.
 */
export default function CollageCluster({
  pieces,
  parallax = false,
  className,
}: {
  pieces: ClusterPiece[];
  parallax?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      {...(parallax ? { "data-fx-parallax": "" } : {})}
    >
      {pieces.map((p, i) => {
        const variant = p.variant ?? "frame";
        const hasChip = Boolean(p.caption || p.figNo);
        return (
          <div
            key={i}
            data-rot={p.rot}
            className={cn(
              variantClass[variant],
              hasChip && "fig-hover pointer-events-auto"
            )}
            style={{
              width: p.w,
              left: p.left,
              right: p.right,
              top: p.top,
              zIndex: p.z,
              transform: `rotate(${p.rot}deg)`,
              ...(variant === "plain"
                ? { boxShadow: "0 10px 26px rgba(17,17,17,0.2)" }
                : {}),
            }}
          >
            {variant === "dither" ? (
              <DitherImage src={p.src} aspect={p.aspect ?? "4 / 3"} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={p.alt ?? ""} loading="eager" />
            )}
            {hasChip && (
              <span className="fig-chip">
                {p.figNo && <em>{p.figNo}</em>}
                {p.caption && (
                  <>
                    {p.figNo ? " — " : ""}
                    {p.caption}
                  </>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
