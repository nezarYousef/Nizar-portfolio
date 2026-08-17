import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";

/* Self-hosted by next/font at build time: no request to fonts.googleapis.com,
   no layout shift from a late swap, and only the subsets actually used ship.

   Weights are deliberately few. Arabic glyph sets are large, so each extra
   weight is a real download - two cover every use on the page. */

export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["400", "600"]
});

/* The Arabic face is attached only on the Arabic route. Including it on the
   English page made the browser preload a font it would never render. */
export const fontClassFor = (lang) =>
  lang === "ar"
    ? `${sans.variable} ${mono.variable} ${arabic.variable}`
    : `${sans.variable} ${mono.variable}`;
