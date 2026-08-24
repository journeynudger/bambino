"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The almanack scroll engine, reconstructed:
 *  - data-fx-header      → blur(8·e) + fade over the first viewport (e = scrollY/vh)
 *  - data-fx-parallax    → children drift upward at staggered speeds, fixed rotations
 *  - data-fx-drift       → element drifts with its position in the viewport
 *  - data-fx-reveal      → cosine-eased fade/rise as it enters the viewport
 *  - data-progress       → text node showing reading progress percentage
 *  - data-fx-footer      → transparent spacer measuring the end-of-chapter
 *                          reveal; drives [data-footer-inner] in the pinned
 *                          fixed layer (translate/scale/opacity emergence)
 *
 * Plus a gentle wheel-driven lerp (desktop, fine pointers, motion allowed)
 * for the smooth scroll feel — native scrollTo keeps the pipeline honest.
 */
export default function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const wide = () => window.innerWidth > 900;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    // static state: no blur/fade/parallax/drift, everything visible & unrolled
    const settleStatic = () => {
      document
        .querySelectorAll<HTMLElement>("[data-fx-header]")
        .forEach((el) => {
          el.style.filter = "";
          el.style.opacity = "";
          el.style.visibility = "";
        });
      document
        .querySelectorAll<HTMLElement>("[data-fx-parallax]")
        .forEach((el) => {
          Array.from(el.children).forEach((child) => {
            const c = child as HTMLElement;
            c.style.transform = `rotate(${c.dataset.rot ?? "0"}deg)`;
          });
        });
      document
        .querySelectorAll<HTMLElement>("[data-fx-drift]")
        .forEach((el) => {
          el.style.transform = `rotate(${el.dataset.rot ?? "0"}deg)`;
        });
      document
        .querySelectorAll<HTMLElement>("[data-fx-unroll]")
        .forEach((el) => {
          el.style.removeProperty("--unroll");
        });
      document
        .querySelectorAll<HTMLElement>("[data-fx-reveal]")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "";
        });
      document
        .querySelectorAll<HTMLElement>("[data-footer-inner]")
        .forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
        });
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;

      if (reduceMotion.matches) {
        settleStatic();
        const rDoc = document.documentElement;
        const rProg = clamp01(y / Math.max(1, rDoc.scrollHeight - vh));
        document
          .querySelectorAll<HTMLElement>("[data-progress]")
          .forEach((el) => {
            el.textContent = String(Math.round(rProg * 100)).padStart(2, "0");
          });
        return;
      }

      document
        .querySelectorAll<HTMLElement>("[data-fx-header]")
        .forEach((el) => {
          const e = clamp01(y / vh);
          const t = Math.max(0, 1 - e);
          el.style.filter = wide() ? `blur(${8 * Math.min(1, e)}px)` : "";
          el.style.opacity = String(t);
          el.style.visibility = t <= 0 ? "hidden" : "visible";
        });

      document
        .querySelectorAll<HTMLElement>("[data-fx-parallax]")
        .forEach((el) => {
          const e = clamp01(y / vh);
          Array.from(el.children).forEach((child, i) => {
            const c = child as HTMLElement;
            const speed = 90 + i * 50;
            const rot = c.dataset.rot ?? "0";
            c.style.transform = `translateY(${-speed * Math.min(1, e)}px) rotate(${rot}deg)`;
          });
        });

      document
        .querySelectorAll<HTMLElement>("[data-fx-drift]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const p = clamp01((vh - r.top) / (vh + r.height));
          const amt = parseFloat(el.dataset.fxDrift || "40");
          const rot = el.dataset.rot ?? "0";
          el.style.transform = `translateY(${(0.5 - p) * amt * 2}px) rotate(${rot}deg)`;
        });

      document
        .querySelectorAll<HTMLElement>("[data-fx-unroll]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const start = vh * 0.92;
          const dist = Math.min(r.height * 1.5, vh * 0.7);
          // panels already well inside the viewport (short pages) open fully
          const p =
            r.top < vh * 0.4 ? 1 : clamp01((start - r.top) / dist);
          const eased = 1 - Math.cos(p * (Math.PI / 2));
          el.style.setProperty("--unroll", String(0.12 + 0.88 * eased));
        });

      document
        .querySelectorAll<HTMLElement>("[data-fx-reveal]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const p = clamp01((vh * 0.92 - r.top) / (vh * 0.45));
          const eased = 1 - Math.cos(p * (Math.PI / 2));
          el.style.opacity = String(eased);
          el.style.transform = `translateY(${(1 - eased) * 34}px)`;
        });

      document
        .querySelectorAll<HTMLElement>("[data-fx-footer]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const p = clamp01((vh - r.top) / Math.min(r.height, vh));
          const eased = 1 - Math.cos(p * (Math.PI / 2));
          const scope = el.parentElement ?? document;
          scope
            .querySelectorAll<HTMLElement>("[data-footer-inner]")
            .forEach((inner) => {
              if (!wide()) {
                inner.style.transform = "";
                inner.style.opacity = "";
                return;
              }
              inner.style.transform = `translateY(${(1 - eased) * -14}%) scale(${0.94 + 0.06 * eased})`;
              inner.style.opacity = String(0.35 + 0.65 * eased);
            });
        });

      const doc = document.documentElement;
      const prog = clamp01(y / Math.max(1, doc.scrollHeight - vh));
      document
        .querySelectorAll<HTMLElement>("[data-progress]")
        .forEach((el) => {
          el.textContent = String(Math.round(prog * 100)).padStart(2, "0");
        });
    };

    // smooth wheel-driven lerp — desktop, fine pointers, motion allowed;
    // native scrollTo fires scroll events, so update() keeps running as-is
    let target = window.scrollY;
    let animating = false;
    let raf2 = 0;

    const onScroll = () => {
      // keep the lerp target honest when scrolling by other means
      if (!animating) target = window.scrollY;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const step = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.min(max, target);
      const cur = window.scrollY;
      const next = cur + (target - cur) * 0.16;
      if (Math.abs(target - next) < 0.6) {
        window.scrollTo({ top: target, behavior: "instant" });
        animating = false;
        return;
      }
      window.scrollTo({ top: next, behavior: "instant" });
      raf2 = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (reduceMotion.matches || !finePointer.matches || !wide()) return;
      if (e.ctrlKey || e.metaKey) return; // pinch-zoom
      if (
        (e.target as HTMLElement)?.closest?.(
          "aside, [data-native-scroll], textarea, select"
        )
      )
        return; // panels scroll natively
      if (e.deltaMode !== 0) return; // line/page-mode mice keep native
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.min(max, Math.max(0, target + e.deltaY));
      if (!animating) {
        animating = true;
        step();
      }
    };

    const onResize = () => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      target = Math.min(max, Math.max(0, target));
      onScroll();
    };

    // cursor-following figure label — runs even under reduced motion
    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const host = t?.closest?.("figure, .fig-hover") as HTMLElement | null;
      if (!host) return;
      const r = host.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - r.left + 16, 8), Math.max(8, r.width - 70));
      const y = e.clientY - r.top - 30;
      const rot = Math.max(-6, Math.min(6, (e.movementX || 0) * 0.8));
      host.style.setProperty("--figx", x + "px");
      host.style.setProperty("--figy", y + "px");
      host.style.setProperty("--figr", rot.toFixed(1) + "deg");
    };

    update();
    // fonts/images shift layout after first paint
    const settle = setTimeout(update, 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("mousemove", onMove, { passive: true });
    reduceMotion.addEventListener("change", onScroll);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("mousemove", onMove);
      reduceMotion.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return null;
}
