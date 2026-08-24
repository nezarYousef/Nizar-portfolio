import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { headers: HEADERS, waitUntil: "networkidle" });
await waitForIntro(page);
await page.evaluate(() => document.fonts.ready);

for (const [id, name] of [["about", "base-about-1440"], ["skills", "base-skills-1440"]]) {
  await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: "start" }), id);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `tmp-shots/${name}.png` });
}
await browser.close();
