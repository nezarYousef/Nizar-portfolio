import { LOCALES, SITE_URL } from "@/lib/site";

export default function sitemap() {
  const lastModified = new Date();

  return Object.entries(LOCALES).map(([lang, { path }]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: lang === "en" ? 1 : 0.8,
    alternates: {
      languages: {
        "en-US": `${SITE_URL}/`,
        "ar-PS": `${SITE_URL}/ar`
      }
    }
  }));
}
