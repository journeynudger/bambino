"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bambino-reading";
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.3;
const STEP = 0.15;

type Prefs = { scale: number; sans: boolean };

const DEFAULTS: Prefs = { scale: 1, sans: false };

function clampScale(n: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(n * 100) / 100));
}

function applyPrefs(prefs: Prefs) {
  document.documentElement.classList.toggle("reading-sans", prefs.sans);
  document.documentElement.style.setProperty(
    "--prose-scale",
    String(prefs.scale),
  );
}

export default function ReadingControls() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const hydrated = useRef(false);

  // load once
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({
          scale:
            typeof parsed.scale === "number"
              ? clampScale(parsed.scale)
              : DEFAULTS.scale,
          sans: Boolean(parsed.sans),
        });
      }
    } catch {
      // malformed storage — keep defaults
    }
    hydrated.current = true;
  }, []);

  // apply + persist whenever prefs change (functional updates keep rapid
  // clicks from clobbering each other)
  useEffect(() => {
    applyPrefs(prefs);
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // storage unavailable — apply without persisting
    }
  }, [prefs]);

  const atMin = prefs.scale <= MIN_SCALE;
  const atMax = prefs.scale >= MAX_SCALE;

  const tBase =
    "grid size-8 place-items-center rounded-full text-[15px] transition-colors";
  const circleBase =
    "grid size-9 place-items-center rounded-full border border-ink-2 transition-colors hover:bg-ink-2 hover:text-paper";

  return (
    <div className="flex items-center gap-3" aria-label="Reading settings">
      <div className="flex items-center rounded-full border border-ink-2 p-0.5">
        <button
          type="button"
          aria-pressed={!prefs.sans}
          aria-label="Serif type"
          className={`${tBase} font-serif${prefs.sans ? "" : " bg-ink-2 text-paper"}`}
          onClick={() => setPrefs((p) => ({ ...p, sans: false }))}
        >
          T
        </button>
        <button
          type="button"
          aria-pressed={prefs.sans}
          aria-label="Sans-serif type"
          className={`${tBase} font-sans${prefs.sans ? " bg-ink-2 text-paper" : ""}`}
          onClick={() => setPrefs((p) => ({ ...p, sans: true }))}
        >
          T
        </button>
      </div>
      <button
        type="button"
        aria-label="Smaller text"
        disabled={atMin}
        className={`${circleBase}${atMin ? " opacity-40" : ""}`}
        onClick={() =>
          setPrefs((p) => ({ ...p, scale: clampScale(p.scale - STEP) }))
        }
      >
        −
      </button>
      <button
        type="button"
        aria-label="Larger text"
        disabled={atMax}
        className={`${circleBase}${atMax ? " opacity-40" : ""}`}
        onClick={() =>
          setPrefs((p) => ({ ...p, scale: clampScale(p.scale + STEP) }))
        }
      >
        +
      </button>
    </div>
  );
}
