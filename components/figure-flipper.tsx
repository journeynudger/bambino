"use client";

import { useEffect, useState } from "react";

type Figure = { src: string; caption: string | null };

/**
 * Stripe-press-style page-turning figure column. Watches the
 * [data-figanchor] markers that lib/content.ts injects into bodyHtml and
 * activates the slide whose section is currently being read. Slide
 * enter/exit motion lives in globals.css (.flipfig / .is-active / .is-past).
 */
export default function FigureFlipper({
  figures,
  chapter,
  title,
}: {
  figures: Figure[];
  chapter: number;
  title: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>("[data-figanchor]"),
      );
      let a = 0;
      for (const el of anchors) {
        const i = parseInt(el.dataset.figanchor || "0", 10);
        if (el.getBoundingClientRect().top < window.innerHeight * 0.55) {
          a = Math.max(a, i);
        }
      }
      setActive(Math.min(a, figures.length - 1));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [figures.length]);

  if (figures.length === 0) return null;

  return (
    <div className="relative min-h-[380px]">
      {figures.map((figure, i) => {
        const state =
          i === active ? " is-active" : i < active ? " is-past" : "";
        const label =
          figure.caption?.toUpperCase() ??
          (i === 0 ? title.toUpperCase() : null);
        return (
          <div key={i} className={"flipfig frame fig-hover" + state}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-auto"
              src={figure.src}
              alt={figure.caption ?? title}
            />
            <span className="fig-chip">
              <em>
                fig {chapter}.{i + 1}
              </em>
              {label && <>—{label}</>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
