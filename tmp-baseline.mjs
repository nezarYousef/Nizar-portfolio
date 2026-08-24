import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const shots = [
  { w: 1440, h: 900, name: "base-hero-1440" },
  { w: 768, h: 1024, name: "base-hero-768" },
  { w: 375, h: 812, name: "base-hero-375" }
];

const browser = await chromium.launch({ channel: "chrome" });
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(BASE, { headers: HEADERS, waitUntil: "networkidle" });
  await waitForIntro(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `tmp-shots/${s.name}.png` });
  // hero geometry
  const geo = await page.evaluate(() => {
    const header = document.querySelector("header") ?? document.querySelector("[class*='eader']");
    const hero = document.getElementById("hero");
    const copy = hero?.querySelector("[class*='copy']");
    const eyebrow = hero?.querySelector("p");
    if (!hero || !eyebrow) return null;
    const hr = hero.getBoundingClientRect();
    const er = eyebrow.getBoundingClientRect();
    const cr = copy?.getBoundingClientRect();
    return {
      headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
      headerBottom: header ? Math.round(header.getBoundingClientRect().bottom) : null,
      heroTop: Math.round(hr.top),
      heroH: Math.round(hr.height),
      vh: window.innerHeight,
      eyebrowTopFromHeroTop: Math.round(er.top - hr.top),
      gapHeaderToEyebrow: Math.round(er.top - (header ? header.getBoundingClientRect().bottom : 0)),
      copyH: cr ? Math.round(cr.height) : null,
      copyBottomGap: cr ? Math.round(hr.bottom - cr.bottom) : null
    };
  });
  console.log(s.name, JSON.stringify(geo));
  await page.close();
}
await browser.close();
