import { cn } from "@/lib/utils";

/** The dithered checker glyph that flanks chapter labels. */
export default function Checker({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className={cn("inline-block size-[9px] fill-current", className)}
      aria-hidden
    >
      <path d="M0 0h2.5v2.5H0zM5 0h2.5v2.5H5zM2.5 2.5H5V5H2.5zM7.5 2.5H10V5H7.5zM0 5h2.5v2.5H0zM5 5h2.5v2.5H5zM2.5 7.5H5V10H2.5zM7.5 7.5H10V10H7.5z" />
    </svg>
  );
}
