"use client";
/* eslint-disable @next/next/no-img-element -- plain <img>: the casts are static files sized by the lattice, not by next/image */

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Contact, Work } from "@/lib/gallery";

/**
 * The wall. An endless lattice of square tiles on paper, each holding one
 * painting cast in white; drag or scroll it in any direction and it goes on.
 * One painting is always lit — in colour, with its title under it. On
 * arrival it is the first work in the gallery file, centred. A mouse lights
 * whatever it rests on; a finger lights what it taps. A click or tap on the
 * lit painting opens it: the wall veils over, the painting lifts from its
 * tile to the centre, and the sheet slides in to read. So on a phone it is
 * tap to see, tap again to read.
 *
 * The lattice repeats the works along a diagonal, so a window a few tiles
 * wide never shows the same painting twice side by side. Positions live in
 * refs and move the lattice by transform; React only re-renders when the set
 * of visible tiles changes.
 */

type Props = { works: Work[]; contact: Contact; initialSlug: string | null };

const MOBILE = 768;
const PLAQUE = 0.74;          // the painting's longer side, as a share of its tile
const SLOP = { mouse: 5, touch: 12, pen: 8 } as const;  // px of movement before a press becomes a drag
const TAP_MS = 500;           // a press held longer than this is not a tap
const MAX_FLICK = 1.8;        // px/ms — the fastest glide a release can start
const STILL_MS = 80;          // a finger that stopped this long before lifting does not glide
const FRICTION = { mouse: 0.94, touch: 0.92, pen: 0.93 } as const;
type PointerKind = keyof typeof SLOP;
const kindOf = (t: string): PointerKind => (t === "touch" || t === "pen" ? t : "mouse");

const mod = (a: number, n: number) => ((a % n) + n) % n;

function tileSize(vw: number, vh: number) {
  if (vw <= MOBILE) return Math.round(vw / 2);
  return Math.round(Math.min(Math.max(300, Math.min(vw / 3.15, vh / 1.85)), 640));
}

/** The painting's box inside a square tile: PLAQUE of the tile along its longer side. */
function plaqueBox(w: Work, tile: number) {
  const aspect = w.width / w.height;
  const width = aspect >= 1 ? PLAQUE * tile : PLAQUE * tile * aspect;
  const height = aspect >= 1 ? (PLAQUE * tile) / aspect : PLAQUE * tile;
  return { width, height };
}

export default function Wall({ works, contact, initialSlug }: Props) {
  const n = works.length;
  // the diagonal step: a row down shifts the works by K, so a window K wide
  // and a few rows tall stays free of repeats
  const K = Math.max(1, Math.ceil(Math.sqrt(n)));

  const wallRef = useRef<HTMLDivElement>(null);
  const latticeRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState({ vw: 0, vh: 0 });
  const tile = viewport.vw ? tileSize(viewport.vw, viewport.vh) : 0;
  const mobile = viewport.vw > 0 && viewport.vw <= MOBILE;

  // the pan, in px, and the range of lattice cells on screen
  const off = useRef({ x: 0, y: 0 });
  const [range, setRange] = useState({ c0: 0, c1: -1, r0: 0, r1: -1 });

  const [open, setOpen] = useState<Work | null>(() => works.find((w) => w.slug === initialSlug) ?? null);
  const [shown, setShown] = useState(false);          // the focus + panel are visible
  const [fromRect, setFromRect] = useState<DOMRect | null>(null);
  // the one lit painting, by lattice cell (a work recurs along the diagonal,
  // and only one of its casts should light): the cell the wall opens on is
  // (home, 0) — the deep-linked work if there is one, else the first in the file
  const home = Math.max(0, works.findIndex((w) => w.slug === initialSlug));
  const [lit, setLit] = useState<string | null>(() => (works.length ? `${home},0` : null));

  // every cast is fetched once at mount — they are small, and a tile must
  // never sit on the wall as an empty plaque while its relief arrives
  useEffect(() => {
    works.forEach((w) => { const im = new Image(); im.src = w.relief; });
  }, [works]);

  // ── measure ───────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const measure = () => setViewport({ vw: window.innerWidth, vh: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // start with the home cell in the centre of the wall
  const started = useRef(false);
  useLayoutEffect(() => {
    if (!tile || started.current) return;
    started.current = true;
    off.current = { x: Math.round((viewport.vw - tile) / 2) - home * tile, y: Math.round((viewport.vh - tile) / 2) };
  }, [tile, viewport, home]);

  const apply = useCallback(() => {
    const el = latticeRef.current;
    if (!el || !tile) return;
    const { x, y } = off.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const c0 = Math.floor(-x / tile) - 1;
    const c1 = Math.ceil((viewport.vw - x) / tile);
    const r0 = Math.floor(-y / tile) - 1;
    const r1 = Math.ceil((viewport.vh - y) / tile);
    setRange((r) => (r.c0 === c0 && r.c1 === c1 && r.r0 === r0 && r.r1 === r1 ? r : { c0, c1, r0, r1 }));
  }, [tile, viewport]);

  useLayoutEffect(apply, [apply]);

  // ── drag, inertia, wheel ───────────────────────────────────────────────
  const press = useRef<{
    x: number; y: number; id: number; kind: PointerKind; dragged: boolean;
    vx: number; vy: number; t: number; t0: number;
  } | null>(null);
  const inertia = useRef<number | null>(null);

  const stopInertia = () => {
    if (inertia.current) cancelAnimationFrame(inertia.current);
    inertia.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (open || e.button !== 0) return;
    stopInertia();
    press.current = {
      x: e.clientX, y: e.clientY, id: e.pointerId, kind: kindOf(e.pointerType),
      dragged: false, vx: 0, vy: 0, t: e.timeStamp, t0: e.timeStamp,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.dragged && Math.hypot(dx, dy) < SLOP[p.kind]) return;
    if (!p.dragged) {
      p.dragged = true;
      wallRef.current?.classList.add("dragging");
      wallRef.current?.setPointerCapture(e.pointerId);
    }
    // velocity is smoothed over the last few moves, so one jittery final
    // sample (a finger rolling as it lifts) cannot throw the wall across the room
    const dt = Math.max(4, e.timeStamp - p.t);
    p.vx = p.vx * 0.6 + (dx / dt) * 0.4;
    p.vy = p.vy * 0.6 + (dy / dt) * 0.4;
    p.t = e.timeStamp;
    p.x = e.clientX;
    p.y = e.clientY;
    off.current = { x: off.current.x + dx, y: off.current.y + dy };
    apply();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    wallRef.current?.classList.remove("dragging");
    if (!p) return;
    if (!p.dragged) {
      // a tap on a painting: light it, or open it if it is the lit one already
      if (e.timeStamp - p.t0 > TAP_MS) return;
      const el = (e.target as HTMLElement).closest<HTMLElement>(".plaque")?.closest<HTMLElement>("[data-slug]");
      if (!el) return;
      if (el.dataset.cell === lit) openWork(el.dataset.slug!, el);
      else setLit(el.dataset.cell!);
      return;
    }
    if (reducedMotion() || e.timeStamp - p.t > STILL_MS) return;
    // let it glide, but never faster than a real flick
    const speed = Math.hypot(p.vx, p.vy);
    const k = speed > MAX_FLICK ? MAX_FLICK / speed : 1;
    const friction = FRICTION[p.kind];
    let vx = p.vx * k * 16, vy = p.vy * k * 16;
    const step = () => {
      vx *= friction;
      vy *= friction;
      if (Math.abs(vx) < 0.08 && Math.abs(vy) < 0.08) { inertia.current = null; return; }
      off.current = { x: off.current.x + vx, y: off.current.y + vy };
      apply();
      inertia.current = requestAnimationFrame(step);
    };
    inertia.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const onWheel = (e: WheelEvent) => {
      if (open) return;
      stopInertia();
      off.current = { x: off.current.x - e.deltaX, y: off.current.y - e.deltaY };
      apply();
    };
    wall.addEventListener("wheel", onWheel, { passive: true });
    return () => wall.removeEventListener("wheel", onWheel);
  }, [apply, open]);


  // ── open / close ───────────────────────────────────────────────────────
  const openWork = useCallback((slug: string, from?: HTMLElement | null) => {
    const w = works.find((x) => x.slug === slug);
    if (!w) return;
    stopInertia();
    const plaque = from?.querySelector<HTMLElement>(".plaque");
    setFromRect(plaque ? plaque.getBoundingClientRect() : null);
    setOpen(w);
    if (from?.dataset.cell) setLit(from.dataset.cell);
    window.history.pushState({ slug }, "", `/gallery/${slug}`);
    document.title = `${w.title} — Lorenzo Scardicchio`;
  }, [works]);

  const closeWork = useCallback((push = true) => {
    setShown(false);
    if (push) window.history.pushState({}, "", "/gallery");
    document.title = "Lorenzo Scardicchio — Paintings";
    window.setTimeout(() => setOpen(null), reducedMotion() ? 0 : 700);
  }, []);

  // a freshly opened work: place it over its tile, then let it travel to the centre
  useLayoutEffect(() => {
    if (!open) return;
    const el = focusRef.current;
    if (!el) return;
    if (fromRect && !reducedMotion()) {
      const final = el.getBoundingClientRect();
      const s = fromRect.width / final.width;
      const dx = fromRect.left + fromRect.width / 2 - (final.left + final.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (final.top + final.height / 2);
      el.style.transition = "none";
      el.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${s})`;
      el.style.opacity = "1";
      void el.offsetWidth; // commit the start
      el.style.transition = "";
    }
    const id = requestAnimationFrame(() => {
      el.style.transform = "";
      setShown(true);
    });
    // once it has arrived, the stylesheet owns its opacity again (so a close can fade it)
    const settle = window.setTimeout(() => { el.style.opacity = ""; }, 1300);
    return () => { cancelAnimationFrame(id); window.clearTimeout(settle); };
  }, [open, fromRect]);

  // deep link: arrive with the work already open
  useEffect(() => {
    if (initialSlug) {
      window.history.replaceState({ slug: initialSlug }, "", `/gallery/${initialSlug}`);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
  }, [initialSlug]);

  // back and forward
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const slug = e.state?.slug as string | undefined;
      if (slug) {
        const w = works.find((x) => x.slug === slug);
        if (w) { setFromRect(null); setOpen(w); }
      } else {
        closeWork(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [works, closeWork]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeWork();
      if (open || !tile) return;
      const step = tile / 2;
      const pan: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (pan[e.key] && !(e.target instanceof HTMLElement && e.target.matches("input, textarea"))) {
        e.preventDefault();
        off.current = { x: off.current.x + pan[e.key][0], y: off.current.y + pan[e.key][1] };
        apply();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, tile, apply, closeWork]);

  const onTileKey = (e: React.KeyboardEvent<HTMLDivElement>, slug: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openWork(slug, e.currentTarget);
    }
  };

  // ── the tiles on screen ────────────────────────────────────────────────
  const tiles = useMemo(() => {
    if (!tile) return [];
    const out: { key: string; col: number; row: number; work: Work }[] = [];
    for (let row = range.r0; row <= range.r1; row++) {
      for (let col = range.c0; col <= range.c1; col++) {
        out.push({ key: `${col},${row}`, col, row, work: works[mod(col + row * K, n)] });
      }
    }
    return out;
  }, [range, tile, works, K, n]);

  const focusBox = useMemo(() => {
    if (!open || !tile) return null;
    const panelW = mobile ? 0 : panelWidth(viewport.vw);
    const max = mobile ? Math.min(viewport.vw * 0.62, viewport.vh * 0.32) : Math.min(viewport.vh * 0.64, 720);
    const aspect = open.width / open.height;
    const width = aspect >= 1 ? max : max * aspect;
    const height = aspect >= 1 ? max / aspect : max;
    const cx = mobile ? viewport.vw / 2 : (viewport.vw - panelW) / 2;
    const cy = mobile ? viewport.vh * 0.19 : viewport.vh / 2;
    return { width, height, cx, cy };
  }, [open, tile, mobile, viewport]);

  const enquire = contact.email && open
    ? `mailto:${contact.email}?subject=${encodeURIComponent(open.title)}`
    : null;

  return (
    <>

      <div
        ref={wallRef}
        className="wall"
        aria-label="The wall"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={latticeRef} className="lattice">
          {tiles.map(({ key, col, row, work }) => {
            const box = plaqueBox(work, tile);
            return (
              <div
                key={key}
                className={`tile${lit === key ? " lit" : ""}`}
                style={{ transform: `translate(${col * tile}px, ${row * tile}px)`, width: tile, height: tile }}
                data-slug={work.slug}
                data-cell={key}
                role="button"
                tabIndex={open ? -1 : 0}
                aria-label={`Open ${work.title}`}
                onKeyDown={(e) => onTileKey(e, work.slug)}
              >
                <figure
                  className="plaque"
                  style={{ width: box.width, height: box.height }}
                  onPointerEnter={(e) => {
                    // a mouse lights what it rests on; a finger lights by tapping (see onPointerUp)
                    if (e.pointerType === "mouse" && !open && !press.current?.dragged) setLit(key);
                  }}
                >
                  <img className="relief" src={work.relief} alt="" draggable={false} decoding="async" />
                  <img className="paint" src={work.file} alt={work.title} draggable={false} loading="lazy" decoding="async" />
                </figure>
                <div className="tile-name"><span>{work.title}</span></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grain" aria-hidden />

      <div className={`veil${shown ? " show" : ""}`} onClick={() => closeWork()} />

      {open && focusBox && (
        <div
          ref={focusRef}
          className={`focus${shown ? " show" : ""}`}
          style={{ left: focusBox.cx, top: focusBox.cy, width: focusBox.width, height: focusBox.height }}
          onClick={() => closeWork()}
        >
          <figure className="plaque">
            <img className="relief" src={open.relief} alt="" draggable={false} />
            <img className="paint" src={open.file} alt={open.title} draggable={false} />
          </figure>
        </div>
      )}
      <div className="grain-focus" aria-hidden />

      <aside className={`panel${shown ? " open" : ""}`} aria-label="About this work" aria-hidden={!shown}>
        <div className="panel-head">
          <button className="panel-x" onClick={() => closeWork()} aria-label="Close">
            <svg viewBox="0 0 256 256" aria-hidden><path d="M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z" /></svg>
          </button>
        </div>
        {open && (
          <div className="panel-body" key={open.slug}>
            <div className="r-rule"><i /><span>From the studio</span><i /></div>
            <h1 className="r-name">{open.title}</h1>
            {(open.year || open.medium || open.size) && (
              <div className="r-era">{[open.year, open.medium, open.size].filter(Boolean).join("  ·  ")}</div>
            )}
            {open.series && <div className="r-series">{open.series}</div>}
            <p className="r-intro">{open.intro}</p>
            {open.notes.length > 0 && (
              <>
                <div className="r-rule"><i /><span>About the work</span><i /></div>
                <div className="tl">
                  {open.notes.map((note, i) => (
                    <div className={`tl-item${i === 0 ? " major" : ""}`} key={i}>
                      <div className="tl-year">{note.label}</div>
                      <div className="tl-text">{note.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {open.quote && (
              <>
                <div className="r-rule"><i /><span>In his words</span><i /></div>
                <blockquote className="r-quote">{open.quote}</blockquote>
              </>
            )}
            {enquire ? (
              <a className="btn-talk" href={enquire}>{contact.label}</a>
            ) : (
              <Link className="btn-talk" href="/about">About the painter</Link>
            )}
          </div>
        )}
        <Link className="panel-credit" href="/">The notebooks of Lorenzo Scardicchio</Link>
      </aside>
    </>
  );
}

function panelWidth(vw: number) {
  if (vw >= 1920) return 580;
  if (vw >= 1600) return 520;
  return 440;
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
