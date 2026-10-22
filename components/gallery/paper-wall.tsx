"use client";

import { Component, type ReactNode } from "react";
import { PaperTexture } from "@paper-design/shaders-react";

/**
 * The wall itself: a sheet of warm white paper drawn live by Paper Shaders'
 * PaperTexture — fibre, a little tooth, the faintest crumple — fixed behind
 * the lattice. Under it, in CSS, the same paper colour with a grain tile, so a
 * browser without WebGL still gets paper, only flatter.
 */
export default function PaperWall() {
  return (
    <div className="paper" aria-hidden>
      <Quiet>
        <PaperTexture
          style={{ width: "100%", height: "100%" }}
          colorBack="#f4f1e9"
          colorFront="#c9bfa9"
          contrast={0.24}
          roughness={0.32}
          fiber={0.5}
          fiberSize={0.17}
          crumples={0.12}
          crumpleSize={0.55}
          folds={0.06}
          foldCount={2}
          drops={0.02}
          fade={0.18}
          scale={0.9}
          fit="cover"
          seed={3.1}
        />
      </Quiet>
    </div>
  );
}

/** Paper Shaders throws where WebGL is missing; the CSS paper underneath stays. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
