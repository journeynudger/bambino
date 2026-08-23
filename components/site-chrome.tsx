"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PostMeta } from "@/lib/content";
import { pad2 } from "@/lib/typo";
import Checker from "@/components/checker";

/** Fixed bottom bar + slide-in chapter index, almanack chrome. */
export default function SiteChrome({ posts }: { posts: PostMeta[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const total = posts.length;

  return (
    <>
      {/* bottom bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-3 pb-2 sm:px-5">
        <Link
          href="/"
          className="mono-label pointer-events-auto bg-paper/90 px-2 py-1.5 !no-underline backdrop-blur-sm"
        >
          [<span aria-hidden>▸</span>]&nbsp;BAMBINO&nbsp;[
          <span data-progress>00</span>%]
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="mono-label pointer-events-auto cursor-pointer bg-paper/90 px-2 py-1.5 backdrop-blur-sm"
        >
          OPEN INDEX&nbsp;[&lt;]
        </button>
      </div>

      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* index panel */}
      <aside
        className={`night fixed inset-y-0 right-0 z-50 flex w-[min(430px,92vw)] flex-col overflow-y-auto px-7 py-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mono-label flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Checker /> INDEX
          </span>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer"
            aria-label="Close index"
          >
            CLOSE&nbsp;[&gt;]
          </button>
        </div>

        <nav className="mt-10 flex flex-col">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="border-b border-dotted border-paper/40 py-3 font-display text-2xl italic hover:pl-2 transition-all"
          >
            Cover
          </Link>
          {posts.map((p, i) => {
            const n = total - i;
            const active = pathname === `/posts/${p.slug}`;
            return (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                onClick={() => setOpen(false)}
                className={`group grid grid-cols-[56px_1fr] gap-4 items-center border-b border-dotted border-paper/40 py-3 transition-all hover:pl-2 ${
                  active ? "pl-2" : ""
                }`}
              >
                {p.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover}
                    alt=""
                    className="aspect-[4/3] w-full object-cover opacity-90"
                  />
                ) : (
                  <div />
                )}
                <span className="block">
                  <span className="mono-label block text-paper/60">
                    CH. {pad2(n)} {active && "// READING"}
                  </span>
                  <span className="font-display text-xl leading-snug">
                    {p.title}
                  </span>
                  <span className="mono-label block pt-1 text-paper/60">
                    {p.readMinutes}MIN READ
                  </span>
                </span>
              </Link>
            );
          })}
          <Link
            href="/art"
            onClick={() => setOpen(false)}
            className="border-b border-dotted border-paper/40 py-3 font-display text-2xl italic transition-all hover:pl-2"
          >
            Figures
          </Link>
          <Link
            href="/podcast"
            onClick={() => setOpen(false)}
            className="border-b border-dotted border-paper/40 py-3 font-display text-2xl italic transition-all hover:pl-2"
          >
            The Podcast
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="border-b border-dotted border-paper/40 py-3 font-display text-2xl italic transition-all hover:pl-2"
          >
            Colophon
          </Link>
        </nav>

        <div className="mono-label mt-auto pt-10 text-paper/50">
          WORDS & ARTWORK — LORENZO SCARDICCHIO
        </div>
      </aside>
    </>
  );
}
