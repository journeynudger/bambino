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

export type Post = PostMeta & {
  canonical: string;
  bodyHtml: string;
  /** first image if the body opens with one (shown in the figures column instead) */
  leadImage: string | null;
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
  post.leadImage = null;

  // if the body opens with a figure, lift it out — it belongs in the figures column
  const lead = post.bodyHtml.match(
    /^\s*<div class="captioned-image-container">[\s\S]*?<\/figure>\s*<\/div>/
  );
  if (lead) {
    const src = lead[0].match(/src="([^"]+)"/);
    post.leadImage = src ? src[1] : null;
    post.bodyHtml = post.bodyHtml.slice(lead[0].length);
  }
  if (!post.leadImage) post.leadImage = post.cover;

  post.bodyHtml = decoratePullQuotes(post.bodyHtml);
  return post;
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
