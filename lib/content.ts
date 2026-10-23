import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  cover: string | null;
  wordcount: number;
  readMinutes: number;
  description: string;
};

/**
 * One spread of a chapter: an optional figure paired with the prose that
 * reads alongside it. figure null = text-only section; html may be "" for a
 * figure-only section.
 */
export type PostSection = {
  figure: { src: string; caption: string | null } | null;
  html: string;
};

export type Post = PostMeta & {
  canonical: string;
  /** the whole document (lead figure lifted out, pull quotes decorated) */
  bodyHtml: string;
  /** first image if the body opens with one (lifted into section 0) */
  leadImage: string | null;
  /**
   * the chapter as a sequence of spreads, in reading order. Section 0 is the
   * opening prose with the lead figure (caption null) when present; each
   * later section pairs an inline figure with the text that follows it.
   */
  sections: PostSection[];
};

export type Artwork = {
  file: string;
  title: string;
  category:
    | "calligraphy"
    | "painting"
    | "photo"
    | "design"
    | "book"
    | "logo"
    | "dj"
    | "prop";
  w: number;
  h: number;
};

const root = process.cwd();

export function getPostIndex(): PostMeta[] {
  const raw = fs.readFileSync(
    path.join(root, "content", "posts", "index.json"),
    "utf8"
  );
  const posts = JSON.parse(raw) as PostMeta[];
  // newest first, chapter numbers assigned oldest = 1
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Chapter number: oldest post is chapter 1 */
export function chapterNumber(slug: string): number {
  const posts = getPostIndex();
  return posts.length - posts.findIndex((p) => p.slug === slug);
}

export function getPost(slug: string): Post {
  const raw = fs.readFileSync(
    path.join(root, "content", "posts", `${slug}.json`),
    "utf8"
  );
  const post = JSON.parse(raw) as Post;

  const lifted = liftLead(cleanBody(post.bodyHtml, post), post.cover);
  post.leadImage = lifted.lead;
  post.bodyHtml = decoratePullQuotes(lifted.html);
  post.sections = buildSections(post.bodyHtml, post.leadImage);
  return post;
}

/** Tag-stripped, trimmed text content of an HTML fragment. */
function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

const FIGURE = /<div class="captioned-image-container">[\s\S]*?<\/figure>\s*<\/div>/;

/** Words of a string, lower-cased, punctuation and emoji dropped. */
function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/&#x27;|&quot;|&amp;/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** How alike two lines are, as the share of words they have in common. */
function alike(a: string, b: string): number {
  const A = new Set(words(a));
  const B = new Set(words(b));
  if (!A.size || !B.size) return 0;
  let both = 0;
  A.forEach((w) => { if (B.has(w)) both += 1; });
  return both / (A.size + B.size - both);
}

/**
 * The newsletter export, made fit to read. Substack habits come out and the
 * chapter is left with only what the reader came for:
 *  - "Read time: …" lines (the sheet already says it)
 *  - the "What did you think of today's edition?" poll at the foot
 *  - whole paragraphs set in bold (three chapters were bold from start to
 *    finish); a short bold line with no full stop was a heading, and becomes one
 *  - empty paragraphs and one-letter strays
 *  - a heading or italic line at the top that only repeats the title or the
 *    subtitle the chapter opening has just shown
 *  - h1/h2 in the body: one heading size inside a chapter
 */
function cleanBody(html: string, post: { title: string; subtitle: string }): string {
  let h = html;

  // the poll at the foot, with the rule that introduces it
  const poll = h.search(/<p>(?:\s*<(?:strong|em|b|i)>)*\s*What did you think of today/i);
  if (poll >= 0) {
    h = h.slice(0, poll).replace(/(?:\s*<div>\s*<hr\s*\/?>\s*<\/div>|\s*<hr\s*\/?>)\s*$/, "");
  }

  // read-time lines
  h = h.replace(/<p>(?:\s*<(?:strong|em|b|i)>)*\s*Read(?:ing)? time:[\s\S]*?<\/p>/gi, "");

  // bold wrapping a whole block: a heading if it reads like one, else plain
  const whole = /<(p|h[1-6]|li)>(\s*(?:<em>|<i>)?\s*)<(strong|b)>((?:(?!<\/?(?:strong|b)\b)[\s\S])*?)<\/\3>(\s*(?:<\/em>|<\/i>)?\s*)<\/\1>/g;
  h = h.replace(whole, (_m, tag: string, pre: string, _b: string, inner: string, post2: string) => {
    const text = textOf(inner);
    const headingLike = text.length <= 60 && !/[.!?…:]["”']?$/.test(text) && !/^[\s–—\-"“‘'(]/.test(text) && !/<a\b/.test(inner);
    if (tag === "p" && !pre.trim() && headingLike) {
      return `<h3>${inner}</h3>`;
    }
    return `<${tag}>${pre}${inner}${post2}</${tag}>`;
  });

  // empties and strays
  h = h.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/g, "");
  h = h.replace(/<p>[^<]{1,2}<\/p>/g, "");

  // one heading size in the body
  h = h.replace(/<(\/?)h[12]>/g, "<$1h3>");

  // an opening line that repeats the title or the subtitle
  const lead = /^(\s*(?:<p>\s*<\/p>\s*)*)((?:<h3>[\s\S]*?<\/h3>|<p>\s*<em>[\s\S]*?<\/em>\s*<\/p>|<p>[\s\S]*?<\/p>|<div class="captioned-image-container">[\s\S]*?<\/figure>\s*<\/div>)\s*)/;
  for (let pass = 0; pass < 3; pass++) {
    const m = h.match(lead);
    if (!m) break;
    const block = m[2];
    if (FIGURE.test(block)) {
      // look past the figure: a restated title directly under it goes too
      const rest = h.slice(m[0].length);
      const under = rest.match(/^\s*<h3>([\s\S]*?)<\/h3>\s*/);
      if (under && alike(textOf(under[1]), post.title) >= 0.6) h = m[0] + rest.slice(under[0].length);
      break;
    }
    const text = textOf(block);
    const repeatsTitle = alike(text, post.title) >= 0.6;
    const repeatsSubtitle = post.subtitle ? alike(text, post.subtitle) >= 0.5 : false;
    if (!repeatsTitle && !repeatsSubtitle) break;
    h = m[1] + h.slice(m[0].length);
  }
  return h;
}

function fileHash(src: string): string | null {
  try {
    return crypto.createHash("md5").update(fs.readFileSync(path.join(root, "public", src))).digest("hex");
  } catch {
    return null;
  }
}

/**
 * The picture that opens the chapter. If the body's first figure comes
 * before any real run of text — after nothing, or after a line or two — it
 * is the opener and is lifted out of the flow so the words follow it at
 * once. Otherwise the cover opens, and any copy of the cover the export
 * repeated in the body (the same file under another name) is dropped so no
 * reader meets the same picture twice before the first paragraph.
 */
function liftLead(html: string, cover: string | null): { lead: string | null; html: string } {
  const m = html.match(FIGURE);
  if (m && m.index !== undefined && textOf(html.slice(0, m.index)).length < 400) {
    const src = m[0].match(/src="([^"]+)"/);
    return { lead: src ? src[1] : cover, html: html.slice(0, m.index) + html.slice(m.index + m[0].length) };
  }
  const coverHash = cover ? fileHash(cover) : null;
  let out = html;
  if (coverHash) {
    out = out.replace(new RegExp(FIGURE.source, "g"), (block) => {
      const src = block.match(/src="([^"]+)"/);
      return src && fileHash(src[1]) === coverHash ? "" : block;
    });
  }
  return { lead: cover, html: out };
}

/**
 * Split the (already pull-quote-decorated) body on its figure wrappers and
 * pair each figure with the prose that follows it. Text-only slivers under
 * 200 characters merge into the previous section.
 */
function buildSections(
  bodyHtml: string,
  leadImage: string | null
): PostSection[] {
  const parts = bodyHtml.split(
    /(<div class="captioned-image-container">[\s\S]*?<\/figure>\s*<\/div>)/
  );
  const sections: PostSection[] = [];

  const push = (figure: PostSection["figure"], html: string) => {
    const text = textOf(html);
    if (!figure && text.length === 0) return;
    if (!figure && text.length < 200 && sections.length > 0) {
      sections[sections.length - 1].html += html;
      return;
    }
    sections.push({ figure, html });
  };

  push(leadImage ? { src: leadImage, caption: null } : null, parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const block = parts[i];
    const src = block.match(/src="([^"]+)"/);
    const cap = block.match(
      /<figcaption class="image-caption">([\s\S]*?)<\/figcaption>/
    );
    const caption = cap ? textOf(cap[1]) : "";
    push(
      src ? { src: src[1], caption: caption || null } : null,
      parts[i + 1] ?? ""
    );
  }
  return sections;
}

export function getAdjacent(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getPostIndex();
  const i = posts.findIndex((p) => p.slug === slug);
  // posts are newest-first; "previous chapter" = older = i+1, "next" = newer = i-1
  return {
    prev: posts[i + 1] ?? null,
    next: i > 0 ? posts[i - 1] : null,
  };
}

/** Short blockquotes become display pull quotes, almanack style. */
function decoratePullQuotes(html: string): string {
  return html.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/g,
    (m, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (text.length > 0 && text.length < 220) {
        return `<blockquote class="pull">${inner}</blockquote>`;
      }
      return m;
    }
  );
}

export function getArt(): Artwork[] {
  const raw = fs.readFileSync(path.join(root, "content", "art.json"), "utf8");
  return JSON.parse(raw) as Artwork[];
}

export function artByCategory(cat: Artwork["category"]): Artwork[] {
  return getArt().filter((a) => a.category === cat);
}

export function getAscii(): Record<string, string> {
  const raw = fs.readFileSync(path.join(root, "content", "ascii.json"), "utf8");
  return JSON.parse(raw) as Record<string, string>;
}

/** Deterministic pick from a list, seeded by string — keeps SSR stable. */
export function pick<T>(list: T[], seed: string, n: number): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: T[] = [];
  const src = [...list];
  while (out.length < n && src.length > 0) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    out.push(src.splice(h % src.length, 1)[0]);
  }
  return out;
}

export function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}
