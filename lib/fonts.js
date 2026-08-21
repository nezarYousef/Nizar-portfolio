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

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const latinFontClass = `${sans.variable} ${mono.variable}`;
