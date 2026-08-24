import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
for (const s of [{ w: 1440, h: 900 }, { w: 768, h: 1024 }, { w: 375, h: 812 }]) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(BASE, { headers: HEADERS, waitUntil: "networkidle" });
  await waitForIntro(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  const geo = await page.evaluate(() => {
    const header = document.querySelector("header");
    const hero = document.getElementById("hero");
    const copy = hero.querySelector("[class*='copy']");
    const eyebrow = copy.querySelector("p");
    const actions = copy.querySelector("[class*='actions']");
    const stats = copy.querySelector("[class*='stats']");
    const hb = header.getBoundingClientRect().bottom;
    const hr = hero.getBoundingClientRect();
    const er = eyebrow.getBoundingClientRect();
    return {
      gapHeaderToEyebrow: Math.round(er.top - hb),
      heroH: Math.round(hr.height),
      vh: window.innerHeight,
      heroBottomToVh: Math.round(hr.bottom - window.innerHeight),
      copyH: Math.round(copy.getBoundingClientRect().height),
      statsTop: Math.round(stats.getBoundingClientRect().top),
      actionsTop: Math.round(actions.getBoundingClientRect().top),
      overflowX: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log(s.w, JSON.stringify(geo));
  if (s.w === 1440) await page.screenshot({ path: "tmp-shots/hero-new-1440.png" });
  await page.close();
}
await browser.close();
