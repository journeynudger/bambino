"use client";

import { PaperTexture } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

const TINTS = {
  pink: "#f2d2ca",
  green: "#c3ddb6",
  blue: "#ccd7e1",
} as const;

export type PanelTint = keyof typeof TINTS;

/**
 * Tinted parchment that UNROLLS as you scroll — the roll cylinder travels
 * down the panel, revealing it, driven by ScrollFX via the --unroll custom
 * property (0 = rolled up, 1 = fully open). Texture by Paper Shaders.
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
      data-fx-unroll
      className="unroll"
      style={{ "--panel-tint": color } as React.CSSProperties}
    >
      <div className={cn("unroll-clip", className)} style={{ background: color }}>
        <PaperTexture
          className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
          style={{ width: "100%", height: "100%" }}
          colorBack="#ffffff"
          colorFront="#b8ae9c"
          contrast={0.3}
          roughness={0.15}
          fiber={0.3}
          fiberSize={0.22}
          crumples={0.22}
          crumpleSize={0.4}
          foldCount={3}
          folds={0.25}
          drops={0.05}
          fade={0.25}
          seed={4}
        />
        <div className="relative z-[2]">{children}</div>
      </div>
      <div className="unroll-roll" aria-hidden />
    </div>
  );
}
