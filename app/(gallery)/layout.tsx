import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import "./gallery.css";
import "../chrome.css";
import PaperWall from "@/components/gallery/paper-wall";
import SiteChrome from "@/components/site-chrome";
import { getArt, getPostIndex } from "@/lib/content";

// the gallery's reading face: Cormorant Garamond, light to medium, roman and italic
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// and Lorenzo's own hand for his name: the Inkwell nib of Lorenzo Longhand,
// drawn for the mailroom (public/fonts/lorenzo-longhand, built by tools/fonts)
const longhand = localFont({
  src: "../../public/fonts/lorenzo-longhand/LorenzoLonghand-Inkwell.woff2",
  weight: "600",
  variable: "--font-longhand",
  display: "swap",
});

// the notebooks' faces, for the bar and the index they share with the gallery
const paperMono = localFont({
  src: "../fonts/PaperMono-Variable.woff2",
  weight: "100 800",
  variable: "--font-paper-mono",
  display: "block",
});
const ebGaramond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display-serif", display: "block" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-source-serif", display: "block" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bambino-five.vercel.app"),
  title: "Lorenzo Scardicchio — Paintings",
  description:
    "The paintings of Lorenzo Scardicchio, cast in white on a paper wall. Hover to see the colour; open one to read about it.",
};

export const viewport: Viewport = {
  themeColor: "#efece4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const posts = getPostIndex();
  const QUIET = ["/art/misty-harbor.jpg", "/art/six-windows.jpg", "/art/mountain.jpg"];
  const plates = getArt().filter((a) => QUIET.includes(a.file)).map((a) => ({ file: a.file, title: a.title }));
  return (
    <html lang="en" className={`${cormorant.variable} ${longhand.variable} ${paperMono.variable} ${ebGaramond.variable} ${sourceSerif.variable}`}>
      <body className="gallery">
        <PaperWall />
        {children}
        <SiteChrome posts={posts} plates={plates} context="The Gallery" bar="top" />
      </body>
    </html>
  );
}
