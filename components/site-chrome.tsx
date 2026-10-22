"use client";
/* eslint-disable @next/next/no-img-element -- small plates in the index, sized by CSS */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PostMeta } from "@/lib/content";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
const word = (n: number) => WORDS[n] ?? String(n);

export type Plate = { file: string; title: string };

/**
 * The chrome, after the Almanack's: a 36px bar across the top (his name,
 * where you are, the progress pill, the index), a 32px bar across the
 * bottom, and the index itself: one clean list on the same paper as the
 * pages, sliding in from the right — the cover, the essays each with its
 * plate, then the gallery, the artwork, the podcast and about.
 */
export default function SiteChrome({ posts, plates }: { posts: PostMeta[]; plates: Plate[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const total = posts.length;

  // posts arrive newest-first; chapters count from the oldest
  const chapters = posts.map((post, i) => ({ post, n: total - i })).sort((a, b) => a.n - b.n);
  const current = chapters.find((c) => pathname === `/posts/${c.post.slug}`) ?? null;

  const close = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle("index-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* ——— the top bar ——— */}
      <div className="chrome chrome-top">
        <Link href="/" className="chrome-sig" onClick={close}>Lorenzo Scardicchio</Link>
        <span className="chrome-sep chrome-desk" aria-hidden />
        {current ? (
          <>
            <span className="chrome-item chrome-desk">Chapter {word(current.n)}</span>
            <span className="chrome-sep chrome-desk" aria-hidden />
            <span className="chrome-item chrome-title chrome-desk">{current.post.title}</span>
          </>
        ) : (
          <span className="chrome-item chrome-desk">The Notebooks</span>
        )}
        <span className="chrome-grow" />
        {!current && (
          <nav className="chrome-links chrome-desk" aria-label="Pages">
            <span className="chrome-sep" aria-hidden />
            <Link href="/#essays" onClick={close}>Essays</Link>
            <span className="chrome-sep" aria-hidden />
            <Link href="/gallery">Artwork</Link>
            <span className="chrome-sep" aria-hidden />
            <Link href="/about" onClick={close}>About</Link>
          </nav>
        )}
        <span className="chrome-sep" aria-hidden />
        <span className="chrome-pill"><span data-progress>00.00</span>%</span>
        <span className="chrome-sep" aria-hidden />
        <button
          className="chrome-burger"
          aria-label={open ? "Close index" : "Open index"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg viewBox="0 0 24 24" aria-hidden><rect x="2" y="2" width="20" height="20" /><path d="M7 7l10 10M17 7L7 17" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden><path d="M2 6h20M2 12h20M2 18h20" /></svg>
          )}
        </button>
      </div>

      {/* ——— the bottom bar ——— */}
      <div className="chrome chrome-bottom">
        <Link href="/" className="chrome-item" onClick={close}>
          [<span aria-hidden>▸</span>]&nbsp;Lorenzo Scardicchio
        </Link>
        <button className={`chrome-item chrome-toggle${open ? " is-open" : ""}`} onClick={() => setOpen((o) => !o)}>
          {open ? "Close index [>]" : "Open index [<]"}
        </button>
      </div>

      {/* ——— the index: one clean list, on paper, from the right ——— */}
      <div className={`index-veil${open ? " is-open" : ""}`} onClick={close} aria-hidden />
      <aside className={`index paper-sheet${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Index" aria-hidden={!open}>
        <nav className="index-list">
          <Link href="/" className="index-row index-row--page" onClick={close}>The Cover</Link>

          <span className="index-label">Essays</span>
          {chapters.map(({ post }) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className={`index-row${current?.post.slug === post.slug ? " is-current" : ""}`}
              onClick={close}
            >
              {post.cover ? <img src={post.cover} alt="" className="index-thumb" /> : <span className="index-thumb" />}
              <span className="index-title">{post.title}</span>
              <span className="index-meta">{post.readMinutes}min</span>
            </Link>
          ))}

          <span className="index-label">Pages</span>
          <Link href="/gallery" className="index-row index-row--page">
            <span className="index-title">Gallery</span>
            {plates.length > 0 && (
              <span className="index-plates">{plates.map((p) => <img key={p.file} src={p.file} alt={p.title} />)}</span>
            )}
          </Link>
          <Link href="/art" className="index-row index-row--page" onClick={close}>Artwork</Link>
          <Link href="/podcast" className="index-row index-row--page" onClick={close}>Podcast</Link>
          <Link href="/about" className="index-row index-row--page" onClick={close}>About</Link>
          <a href="https://lorenzoscardicchio.substack.com" target="_blank" rel="noreferrer" className="index-row index-row--page">Substack ↗</a>
        </nav>
      </aside>
    </>
  );
}
