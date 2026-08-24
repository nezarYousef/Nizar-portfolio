import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
for (const s of [{ w: 1440, h: 900 }, { w: 1024, h: 800 }, { w: 375, h: 812 }]) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  await page.goto(BASE, { headers: HEADERS, waitUntil: "networkidle" });
  await waitForIntro(page);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getElementById("about").scrollIntoView({ block: "start" }));
  await page.waitForTimeout(2200);
  const geo = await page.evaluate(() => {
    const grid = document.querySelector("#about [class*='grid']");
    const heading = document.querySelector("#about [class*='heading']");
    const panel = document.querySelector("#about [class*='panel']");
    const prose = document.querySelector("#about [class*='prose']");
    const h2 = document.querySelector("#about h2");
    if (!panel || !h2) return null;
    const pr = panel.getBoundingClientRect();
    const kr = heading.querySelector("p").getBoundingClientRect();
    const tr = h2.getBoundingClientRect();
    const por = prose.getBoundingClientRect();
    return {
      panelTopVsKickerTop: Math.round(pr.top - kr.top),
      panelTopVsTitleTop: Math.round(pr.top - tr.top),
      panelRight: Math.round(pr.right),
      titleRight: Math.round(tr.right),
      panelBottomVsProseBottom: Math.round(pr.bottom - por.bottom),
      panelH: Math.round(pr.height),
      panelW: Math.round(pr.width),
      overflowX: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log(s.w, JSON.stringify(geo));
  await page.screenshot({ path: `tmp-shots/about-new-${s.w}.png` });
  await page.close();
}
await browser.close();
