import { LOCALES, SITE_URL } from "@/lib/site";
import { portfolioCopy } from "@/data/portfolio";
import "@/app/globals.css";

/* Runs before first paint, so a dark-mode visitor never sees a light flash.
   Kept deliberately tiny and dependency-free - it is inlined into every page.

   It sits as the first child of <body>, not inside a hand-written <head>.
   Rendering our own <head> element suppressed Next's managed head injection,
   and with it every next/font <link rel="preload">, so the faces were only
   discovered when the CSS asked for a glyph - which is what made them land
   late enough to reflow the page. A blocking inline script at the top of
   <body> still executes before any body content is painted, so the theme is
   set just as early. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("nizar-portfolio-theme");if(t!=="dark"&&t!=="light"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;

function StructuredData({ lang }) {
  const copy = portfolioCopy[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: copy.hero.name,
    jobTitle: copy.hero.eyebrow,
    description: copy.hero.description,
    url: `${SITE_URL}${LOCALES[lang].path}`,
    image: `${SITE_URL}/images/profile/nizar-profile-full.jpeg`,
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
    <html lang={lang} dir={LOCALES[lang].dir} className={fontClass}>
      <body>
        {/* eslint-disable-next-line @next/next/no-sync-scripts, react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <StructuredData lang={lang} />
        {children}
      </body>
    </html>
  );
}
