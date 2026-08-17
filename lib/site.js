/* Single source for absolute URLs. Override in production by setting
   NEXT_PUBLIC_SITE_URL - the default is only a fallback for local builds. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://nizar-portfolio.vercel.app";

export const LOCALES = {
  en: { path: "/", locale: "en_US", dir: "ltr" },
  ar: { path: "/ar", locale: "ar_PS", dir: "rtl" }
};

export const alternatesFor = (lang) => ({
  canonical: LOCALES[lang].path,
  languages: {
    "en-US": "/",
    "ar-PS": "/ar",
    "x-default": "/"
  }
});
