import { portfolioCopy } from "@/data/portfolio";
import { LOCALES, SITE_URL, alternatesFor } from "@/lib/site";

const KEYWORDS = [
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
];

export function buildMetadata(lang) {
  const copy = portfolioCopy[lang];
  const title = `${copy.hero.name} | ${copy.hero.eyebrow}`;
  const description = copy.hero.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${copy.hero.name}`
    },
    description,
    authors: [{ name: copy.hero.name }],
    creator: copy.hero.name,
    keywords: KEYWORDS,
    alternates: alternatesFor(lang),
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", sizes: "48x48", type: "image/png" }
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }]
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: LOCALES[lang].path,
      siteName: copy.hero.name,
      locale: LOCALES[lang].locale,
      alternateLocale: Object.values(LOCALES)
        .map((l) => l.locale)
        .filter((l) => l !== LOCALES[lang].locale),
      images: [{ url: "/og", width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og"]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" }
    }
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f11" }
  ]
};
