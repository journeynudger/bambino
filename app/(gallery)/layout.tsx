import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./gallery.css";
import PaperWall from "@/components/gallery/paper-wall";

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
  return (
    <html lang="en" className={`${cormorant.variable} ${longhand.variable}`}>
      <body className="gallery">
        <PaperWall />
        {children}
      </body>
    </html>
  );
}
