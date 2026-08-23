import { Fragment, type ReactNode } from "react";

const SMALL_WORDS = new Set([
  "of",
  "the",
  "a",
  "an",
  "on",
  "to",
  "in",
  "and",
  "for",
  "we're",
  "i'll",
  "your",
  "my",
]);

/** Almanack-style display titles: connector words set in italic. */
export function displayTitle(title: string): ReactNode {
  const words = title.split(" ");
  return words.map((w, i) => {
    const clean = w.toLowerCase().replace(/[^a-z']/g, "");
    const italic = i > 0 && SMALL_WORDS.has(clean);
    return (
      <Fragment key={i}>
        {italic ? <em>{w}</em> : w}
        {i < words.length - 1 ? " " : ""}
      </Fragment>
    );
  });
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
