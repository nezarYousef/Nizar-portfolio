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
 * Applies the saved theme and language before first paint so a returning
 * visitor never sees a flash of the wrong theme or text direction.
 */
const bootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("nizar-portfolio-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}d.dataset.theme=t;var l=localStorage.getItem("nizar-portfolio-language");if(l==="ar"){d.lang="ar";d.dir="rtl";}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/archivo-var.woff2"
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
      <body>{children}</body>
    </html>
  );
}
