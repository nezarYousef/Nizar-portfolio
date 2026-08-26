import { LOCALES, SITE_URL } from "@/lib/site";
import { portfolioCopy, profileImage } from "@/data/portfolio";
import "@/app/globals.css";

/* Runs before first paint, so a visitor never sees the wrong theme flash.
   Kept deliberately tiny and dependency-free - it is inlined into every page.

   Precedence: a stored preference always wins; a first visit with no stored
   preference follows the OS setting; dark remains the final fallback so the
   space-first composition is preserved on systems that express no colour
   preference at all.

   It sits as the first child of <body>, not inside a hand-written <head>.
   Rendering our own <head> element suppressed Next's managed head injection,
   and with it every next/font <link rel="preload">, so the faces were only
   discovered when the CSS asked for a glyph - which is what made them land
   late enough to reflow the page. A blocking inline script at the top of
   <body> still executes before any body content is painted, so the theme is
   set just as early. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("nizar-portfolio-theme");if(t!=="dark"&&t!=="light"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

/* Mirrors IntroSequence's conditions so the right hold exists before first
   paint: "boot" paints an opaque space cover ahead of the explosion sequence;
   "quick" merely holds the hero entrance for the few frames until hydration
   confirms there is nothing to play - without it the hero would flash
   statically and then snap back to replay its entrance. The full sequence is
   reserved for devices that can afford it: reduced-motion visitors and
   low-memory / data-saver devices get the quick hand-over instead of a
   particle canvas on a throttled CPU. Without JS the attribute never appears
   at all. */
const INTRO_SCRIPT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches){return}var lowPower=(navigator.deviceMemory&&navigator.deviceMemory<4)||(navigator.connection&&navigator.connection.saveData);document.documentElement.dataset.intro=sessionStorage.getItem("nizar-portfolio-intro")==="done"?"quick":(lowPower?"quick":"boot")}catch(e){document.documentElement.dataset.intro="boot"}})();`;

function StructuredData({ lang }) {
  const copy = portfolioCopy[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: copy.hero.name,
    jobTitle: copy.hero.eyebrow,
    description: copy.hero.title,
    url: `${SITE_URL}${LOCALES[lang].path}`,
    image: `${SITE_URL}${profileImage}`,
    email: copy.contact.links.email.replace("mailto:", ""),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: copy.education.items[0].company
    },
    knowsAbout: copy.skills.coreStack,
    sameAs: [
      copy.contact.links.github,
      copy.contact.links.linkedin,
      copy.contact.links.instagram
    ]
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootShell({ lang, fontClass, children }) {
  return (
    /* THEME_SCRIPT sets data-theme on this element before React hydrates, so
       the server's <html> and the client's differ by design and React warns
       about it in development. suppressHydrationWarning applies to this
       element's own attributes and text only - one level, no deeper - so the
       tree below is still fully checked and a genuine mismatch anywhere else
       still surfaces. Verified: with this in place the dev console is clean
       on both locales in both themes. */
    <html
      lang={lang}
      dir={LOCALES[lang].dir}
      className={fontClass}
      suppressHydrationWarning
    >
      <body>
        {/* eslint-disable-next-line @next/next/no-sync-scripts, react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts, react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <StructuredData lang={lang} />
        {children}
      </body>
    </html>
  );
}
