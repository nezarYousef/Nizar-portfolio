import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";

/* Self-hosted by next/font at build time: no request to fonts.googleapis.com,
   and only the subsets actually used ship.

   Weights are deliberately few. Arabic glyph sets are large, so each extra
   weight is a real download - two cover every use on the page.

   display: "swap", chosen over "optional" on measured evidence rather than
   reputation. "optional" is the usual advice for killing font-swap CLS, and
   it does: 0.0000 everywhere. But measuring which face the renderer actually
   painted - via CSS.getPlatformFontsForNode, not document.fonts.check(),
   which only reports that a face downloaded - showed the cost. On a cold
   cache over Fast 3G, "optional" painted Arial 3 runs out of 3 in BOTH
   locales while quietly downloading the real face for a next visit that may
   never happen. In Arabic that is not a subtle downgrade: it hands the reader
   Arial's Arabic instead of IBM Plex Sans Arabic.

   With "swap" plus the space reserved in Hero.module.css for the two blocks
   whose line count changes, the same cold Fast 3G runs painted Inter 3/3 and
   IBM Plex Sans Arabic 3/3, at 0.0004 CLS on / and 0.0115 on /ar - an order
   of magnitude inside the 0.1 "good" threshold, and down from the 0.140 that
   started this. Real typography for slow visitors is worth 0.0115. */

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
