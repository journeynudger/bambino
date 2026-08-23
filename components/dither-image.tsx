"use client";

import { ImageDithering } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

/**
 * The almanack's duotone-dithered figure treatment — an image reduced to
 * ordered-dither dots in two inks, via Paper Shaders' ImageDithering.
 */
export default function DitherImage({
  src,
  className,
  aspect = "4 / 5",
  colorBack = "#e3e6d8",
  colorFront = "#464b36",
}: {
  src: string;
  className?: string;
  aspect?: string;
  colorBack?: string;
  colorFront?: string;
}) {
  return (
    <div className={cn("relative", className)} style={{ aspectRatio: aspect }}>
      <ImageDithering
        image={src}
        colorBack={colorBack}
        colorFront={colorFront}
        colorHighlight="#f5f6ef"
        type="4x4"
        size={2}
        colorSteps={3}
        fit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
