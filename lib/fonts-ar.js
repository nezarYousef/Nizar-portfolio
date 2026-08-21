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
 */

export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
  weight: ["400", "600"]
});

export const arabicFontClass = `${latinFontClass} ${arabic.variable}`;
