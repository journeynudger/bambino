import type { Metadata } from "next";
import { EB_Garamond, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import ScrollFX from "@/components/scroll-fx";
import SiteChrome from "@/components/site-chrome";
import { getPostIndex } from "@/lib/content";

// display face: a free revival of Claude Garamond's types (true italic),
// standing in for a licensed Old Claude / Blacker Pro if those are dropped in
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display-serif",
  display: "block",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "block",
});

const paperMono = localFont({
  src: "../fonts/PaperMono-Variable.woff2",
  weight: "100 800",
  variable: "--font-paper-mono",
  display: "block",
});

// Lorenzo's own hand — the Inkwell nib of Lorenzo Longhand, drawn for the
// mailroom (public/fonts/lorenzo-longhand, built by tools/fonts) — signs the cover
const longhand = localFont({
  src: "../../public/fonts/lorenzo-longhand/LorenzoLonghand-Inkwell.woff2",
  weight: "600",
  variable: "--font-longhand",
  display: "block",
});

export const metadata: Metadata = {
  title: "Lorenzo Scardicchio",
  description:
    "Essays & artwork by Lorenzo Scardicchio — on attention, technology, and becoming who you want to be.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = getPostIndex();
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} ${sourceSerif.variable} ${paperMono.variable} ${longhand.variable}`}
      >
        <ScrollFX />
        {children}
        <SiteChrome posts={posts} />
      </body>
    </html>
  );
}
