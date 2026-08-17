import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";

/* Self-hosted by next/font at build time: no render-blocking request to
   fonts.googleapis.com, no layout shift from a late swap, and only the
   subsets actually used are shipped. */

export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  axes: []
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"]
});

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"]
});

export const fontClass = `${sans.variable} ${mono.variable} ${arabic.variable}`;
