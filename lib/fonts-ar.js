import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { latinFontClass } from "./fonts";

/* The Arabic face is in its own module, imported only by app/(ar)/layout.jsx,
   and that is the whole point of the file.

   It used to sit in ./fonts.js alongside the Latin faces, with a helper that
   attached its CSS variable only on the Arabic route. That helper controlled
   which variable was applied, and nothing else - which turned out not to be
   what governs preloading. next/font's manifest maps FONT LOADER MODULES to
   route entrypoints by walking the module graph, so a loader call that both
   layouts can reach is preloaded on both routes no matter which class name is
   rendered. Measured on the Vercel preview, the English page was preloading
   69,884 bytes of Arabic font at High priority that it never rendered - 47% of
   its font payload, one file taking 569ms, competing with the CSS the page
   actually needed. Splitting the module is what removes it from /'s graph.

   (None of this was visible locally: a Windows path-separator bug in
   next-font-manifest-plugin.js means no preload links are emitted on this
   machine at all.)

   weights: Arabic glyph sets are large, so each extra weight is a real
   download - two cover every use on the page.

   adjustFontFallback: false because next/font's generated fallback is wrong in
   the dimension that matters here. It corrects vertical metrics but leaves
   advance width alone, and measured against the real face on this page's own
   strings, its Arabic ran 9.9% NARROWER than IBM Plex Sans Arabic. A fallback
   that is a tenth narrower fits text into fewer lines than the real face will,
   so line counts change when the swap lands, and a paragraph that reflows
   moves everything under it. That is what produced 0.1267 CLS on /ar at 768px
   - over the 0.1 "good" threshold, reproducible 5 runs out of 5. The
   replacement family is declared in app/globals.css with a size-adjust
   computed from that measurement; see the note there. */

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["400", "600"],
  adjustFontFallback: false,
  fallback: ["IBM Plex Arabic Metric Fallback", "Arial", "sans-serif"]
});

export const arabicFontClass = `${latinFontClass} ${arabic.variable}`;
