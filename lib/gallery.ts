import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

/**
 * The gallery wall: every painting from content/gallery.yml, with the white
 * relief scripts/relief.py cast for it under public/gallery. Read once per
 * build; the YAML is the only place a title or a note lives.
 */

export type Note = { label: string; text: string };

export type Work = {
  slug: string;
  title: string;
  /** the painting, under public/ */
  file: string;
  /** the plaster cast, under public/ */
  relief: string;
  width: number;
  height: number;
  year: string | null;
  medium: string | null;
  size: string | null;
  series: string | null;
  intro: string;
  notes: Note[];
  quote: string | null;
};

export type Contact = { email: string | null; label: string };

const ROOT = process.cwd();
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

const text = (v: unknown): string | null => {
  const s = v == null ? "" : String(v).trim();
  return s ? s : null;
};

/** Pixel size of a JPEG or WebP under public/, from its header. */
function imageSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(path.join(ROOT, "public", file));
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) throw new Error(`${file}: bad JPEG marker`);
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { width: 1 + (b & 0x3fff), height: 1 + ((b >> 14) & 0x3fff) };
    }
    if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`${file}: not a JPEG or WebP`);
}

function buildWork(row: Record<string, unknown>): Work {
  const slug = String(row.slug ?? "").trim();
  if (!SLUG.test(slug)) throw new Error(`gallery.yml: bad slug ${JSON.stringify(row.slug)}`);
  const file = String(row.file ?? "").trim();
  if (!file.startsWith("/")) throw new Error(`gallery.yml: ${slug} needs a file under public/, like /art/${slug}.jpg`);
  const relief = `/gallery/${slug}.webp`;
  for (const f of [file, relief]) {
    if (!fs.existsSync(path.join(ROOT, "public", f))) {
      throw new Error(`gallery.yml: ${slug} points at public${f}, which is not there` +
        (f === relief ? " — run scripts/relief.py on the painting" : ""));
    }
  }
  const notes = (Array.isArray(row.notes) ? row.notes : [])
    .map((n) => ({ label: text((n as Record<string, unknown>)?.label) ?? "", text: text((n as Record<string, unknown>)?.text) ?? "" }))
    .filter((n) => n.text);
  return {
    slug,
    title: String(row.title ?? slug),
    file,
    relief,
    ...imageSize(file),
    year: text(row.year),
    medium: text(row.medium),
    size: text(row.size),
    series: text(row.series),
    intro: String(row.intro ?? "").trim(),
    notes,
    quote: text(row.quote),
  };
}

let cache: { works: Work[]; contact: Contact } | null = null;

function load() {
  if (cache) return cache;
  const raw = YAML.parse(fs.readFileSync(path.join(ROOT, "content", "gallery.yml"), "utf8")) as Record<string, unknown>;
  const works = (Array.isArray(raw.works) ? raw.works : []).map((r) => buildWork(r as Record<string, unknown>));
  const slugs = works.map((w) => w.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) throw new Error(`gallery.yml: duplicate slugs ${dupes.join(", ")}`);
  const c = (raw.contact ?? {}) as Record<string, unknown>;
  cache = { works, contact: { email: text(c.email), label: text(c.label) ?? "Enquire about this work" } };
  return cache;
}

export const getWorks = (): Work[] => load().works;
export const getWork = (slug: string): Work | undefined => load().works.find((w) => w.slug === slug);
export const getContact = (): Contact => load().contact;

/** The line under a title: the parts that are filled in, dotted together. */
export const workLine = (w: Work): string => [w.year, w.medium, w.size].filter(Boolean).join("  ·  ");
