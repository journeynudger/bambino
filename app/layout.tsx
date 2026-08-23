import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ScrollFX from "@/components/scroll-fx";
import SiteChrome from "@/components/site-chrome";
import { getPostIndex } from "@/lib/content";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
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
  src: "./fonts/PaperMono-Variable.woff2",
  weight: "100 800",
  variable: "--font-paper-mono",
  display: "block",
});

export const metadata: Metadata = {
  title: "bambino",
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
        className={`${fraunces.variable} ${sourceSerif.variable} ${paperMono.variable}`}
      >
        <ScrollFX />
        {children}
        <SiteChrome posts={posts} />
      </body>
    </html>
  );
}
