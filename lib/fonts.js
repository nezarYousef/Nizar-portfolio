import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";

/* Self-hosted by next/font at build time: no request to fonts.googleapis.com,
   and only the subsets actually used ship.

   Weights are deliberately few. Arabic glyph sets are large, so each extra
   weight is a real download - two cover every use on the page.

   display: "optional", not "swap". next/font's generated fallback corrects the
   fallback's vertical metrics but not its glyph advance widths, so a late swap
   still changes how many lines a block occupies - measured at 0.140 CLS on
   /ar, where the hero identity chips went from one row to two, and 0.036 on /,
   where the h1 went from one line to two. Reserving space is not a fix here:
   the same row wraps to 4 rows at 375px, 2 at 1024px and 1 at 768px in Arabic,
   so there is no height to reserve. "optional" gives the font a ~100ms block
   window and then commits to whatever won, for the whole page view - the swap,
   and the shift with it, cannot happen. The faces are same-origin and
   preloaded, so they normally win that window; on a slow first visit the
   reader gets the metric-adjusted fallback and the real face from cache on
   the next navigation. */

export const sans = Inter({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-sans"
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "optional",
  variable: "--font-arabic",
  weight: ["400", "600"]
});

/* The Arabic face is attached only on the Arabic route. Including it on the
   English page made the browser preload a font it would never render. */
export const fontClassFor = (lang) =>
  lang === "ar"
    ? `${sans.variable} ${mono.variable} ${arabic.variable}`
    : `${sans.variable} ${mono.variable}`;
