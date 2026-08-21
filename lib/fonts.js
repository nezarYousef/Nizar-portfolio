import { Inter, JetBrains_Mono } from "next/font/google";

/* Self-hosted by next/font at build time: no request to fonts.googleapis.com,
   and only the subsets actually used ship.

   display: "swap", chosen over "optional" on measured evidence rather than
   reputation. "optional" is the usual advice for killing font-swap CLS, and
   it does: 0.0000 everywhere. But measuring which face the renderer actually
   painted - via CSS.getPlatformFontsForNode, not document.fonts.check(),
   which only reports that a face downloaded - showed the cost. On a cold
   cache over Fast 3G, "optional" painted Arial 3 runs out of 3 in BOTH
   locales while quietly downloading the real face for a next visit that may
   never happen. In Arabic that is not a subtle downgrade: it hands the reader
   Arial's Arabic instead of IBM Plex Sans Arabic.

   The Arabic face lives in ./fonts-ar.js, imported only by the Arabic layout.
   That separation is load-bearing rather than tidiness: see the note there. */

export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

/* adjustFontFallback: false because next/font builds every fallback from
   local("Arial"), including the one standing in for a monospace face, and
   compensates with size-adjust: 134.59%. Uniform scaling cannot make a
   proportional font match a monospace one - the per-character widths differ -
   so the error varies by string. Measured across the mono strings on this
   page, the size-adjust each one would need to match JetBrains Mono spans a
   34.3% range with Arial as the source. There is no value that fits them all.

   The visible cost was the hero eyebrow, which is mono, uppercase and
   letter-spaced. At 480px it needs 355px on one line in the real face and
   446px in the Arial fallback - 26% wider - so it wrapped to two lines until
   the font landed and then unwrapped, moving the whole vertically-centred hero
   with it. 0.1279 CLS, identical on every build measured, in English, at a
   breakpoint that was not swept until now.

   A monospace source fixes it at the root. Same measurement with Courier New:
   size-adjust 99.99% with 0% spread - the two faces share an advance ratio, so
   no correction is needed and every string matches. See app/globals.css. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
  adjustFontFallback: false,
  fallback: ["JetBrains Mono Metric Fallback", "ui-monospace", "monospace"]
});

export const latinFontClass = `${sans.variable} ${mono.variable}`;
