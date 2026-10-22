"use client";
/* eslint-disable @next/next/no-img-element -- small plates in the index, sized by CSS */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PostMeta } from "@/lib/content";
import { pad2 } from "@/lib/typo";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
const word = (n: number) => WORDS[n] ?? String(n);

export type Plate = { file: string; title: string };

/**
 * The chrome, after the Almanack's: a 36px bar across the top (his name,
 * where you are, the progress pill, the index), a 32px bar across the
 * bottom, and the index itself — an open book: the essays as numerals on the
 * left page, with the chapter you point at previewed beneath them; the
 * gallery, the plates, the podcast and about on the right page.
 */
export default function SiteChrome({ posts, plates }: { posts: PostMeta[]; plates: Plate[] }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const total = posts.length;

  // posts arrive newest-first; chapters count from the oldest
  const chapters = posts.map((post, i) => ({ post, n: total - i })).sort((a, b) => a.n - b.n);
  const current = chapters.find((c) => pathname === `/posts/${c.post.slug}`) ?? null;
  const previewed = chapters.find((c) => c.post.slug === hovered) ?? current ?? chapters[chapters.length - 1] ?? null;

  const close = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle("book-open", open);
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

      {/* ——— the index: an open book ——— */}
      <div className={`book${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Index" aria-hidden={!open}>
        <div className="book-page book-page--left">
          <h2 className="book-label">Essays</h2>
          <div className="book-numerals" onMouseLeave={() => setHovered(null)}>
            {chapters.map(({ post, n }, i) => (
              <span key={post.slug} className="book-cell">
                {i > 0 && <span className="slash" aria-hidden>/</span>}
                <Link
                  href={`/posts/${post.slug}`}
                  className={`book-num${current?.post.slug === post.slug ? " is-current" : ""}${hovered === post.slug ? " is-hover" : ""}`}
                  onMouseEnter={() => setHovered(post.slug)}
                  onFocus={() => setHovered(post.slug)}
                  onClick={close}
                  aria-label={`Chapter ${n}: ${post.title}`}
                >
                  <span>{pad2(n)}</span>
                </Link>
              </span>
            ))}
          </div>
          {previewed && (
            <Link href={`/posts/${previewed.post.slug}`} className="book-preview" onClick={close}>
              <span className="book-preview-text">
                <span className="book-hl">Chapter {word(previewed.n)}:</span>
                <br />
                <span className="book-hl">{previewed.post.title}</span>
                {previewed.post.subtitle && <span className="book-sub">{previewed.post.subtitle}</span>}
                <span className="book-meta">Ch. {pad2(previewed.n)} &middot; {previewed.post.readMinutes}min read</span>
              </span>
              {previewed.post.cover && <img src={previewed.post.cover} alt="" className="book-preview-fig" />}
            </Link>
          )}
        </div>

        <div className="book-gutter" aria-hidden />

        <div className="book-page book-page--right">
          <h2 className="book-label">Artwork, <em>the</em> Podcast, <em>and</em> About</h2>
          <Link href="/gallery" className="book-item">
            <span>The <em>Gallery</em></span>
            {plates.length > 0 && (
              <span className="book-plates">
                {plates.map((p) => <img key={p.file} src={p.file} alt={p.title} />)}
              </span>
            )}
          </Link>
          <Link href="/art" className="book-item book-item--r" onClick={close}><span>Artwork <em>plates</em></span></Link>
          <Link href="/podcast" className="book-item" onClick={close}><span>The <em>Podcast</em></span></Link>
          <Link href="/about" className="book-item book-item--r" onClick={close}><span>About <em>Lorenzo</em></span></Link>
          <div className="book-foot">
            <div>
              <h3 className="book-label">Back <em>matter</em></h3>
              <Link href="/" className="book-small" onClick={close}>The Cover</Link>
              <Link href="/#essays" className="book-small" onClick={close}>Every Essay</Link>
            </div>
            <div className="book-formats">
              <h3 className="book-label"><em>Elsewhere</em></h3>
              <a href="https://lorenzoscardicchio.substack.com" target="_blank" rel="noreferrer" className="book-small">[ Substack ]</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
