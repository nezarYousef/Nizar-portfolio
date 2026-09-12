import "./globals.css";

export const metadata = {
  title: "Nizar Alqerem | Computer Engineer",
  description:
    "Professional portfolio of Nizar Yousef Alqerem, a computer engineer focused on software engineering, modern web development, AI, machine learning, computer vision, and applied systems.",
  authors: [{ name: "Nizar Yousef Alqerem" }],
  keywords: [
    "Nizar Yousef Alqerem",
    "Computer Engineer",
    "Software Engineer",
    "Machine Learning",
    "AI",
    "Computer Vision",
    "React",
    "Next.js",
    "Python",
    "Java",
    "Portfolio"
  ],
  openGraph: {
    title: "Nizar Yousef Alqerem | Computer Engineer",
    description:
      "Engineering portfolio showcasing software, web, AI, machine learning, computer vision, and systems projects.",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e0d" }
  ]
};

/*
 * Runs before first paint. Three jobs:
 *  - apply the saved theme and language, so a returning visitor never sees a
 *    flash of the wrong theme or text direction;
 *  - decide whether the intro should play, and mark <html> accordingly so the
 *    static cover below is on screen from the very first frame;
 *  - release the cover if the bundle never takes over, so a failed script load
 *    can never leave the page hidden and scroll-locked.
 */
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("nizar-portfolio-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}d.dataset.theme=t;var l=localStorage.getItem("nizar-portfolio-language");if(l==="ar"){d.lang="ar";d.dir="rtl";}}catch(e){}var play=true;try{if(sessionStorage.getItem("nizar-portfolio-intro")==="1")play=false;}catch(e){}try{if(location.hash.length>1)play=false;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)play=false;}catch(e){}d.dataset.intro=play?"1":"0";if(play){d.classList.add("is-booting");setTimeout(function(){if(d.dataset.intro==="1"&&!document.querySelector('[role="dialog"]')){d.dataset.intro="0";d.classList.remove("is-booting");}},6000);}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/manrope-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {/*
         * Painted with the document itself, before any JavaScript runs, so the
         * intro is on screen from the first frame instead of flashing the page
         * first. The React intro mounts on top of it and it is hidden again
         * when `data-intro` flips to "0".
         */}
        <div id="boot-cover" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        {children}
      </body>
    </html>
  );
}
