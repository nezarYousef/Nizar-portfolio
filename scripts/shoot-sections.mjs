/* Element-level screenshots at full resolution, for actually inspecting a
   section rather than squinting at a downscaled full-page capture. */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:4321";
const OUT = "screenshots/sections";

const TARGETS = (process.env.SHOOT_TARGETS ?? "hero,skills,projects,contact").split(",");
const COMBOS = (process.env.SHOOT_COMBOS ?? "en:light:1440,ar:dark:1440,en:light:375,ar:light:375")
  .split(",")
  .map((combo) => {
    const [locale, theme, width] = combo.split(":");
    return { locale, theme, width: Number(width) };
  });

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

for (const { locale, theme, width } of COMBOS) {
  const context = await browser.newContext({
    viewport: { width, height: width < 500 ? 812 : 900 },
    deviceScaleFactor: 1
  });
  await context.addInitScript((value) => {
    localStorage.setItem("nizar-portfolio-theme", value);
  }, theme);

  const page = await context.newPage();
  await page.goto(`${BASE}${locale === "ar" ? "/ar" : "/"}`, {
    waitUntil: "networkidle"
  });

  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.5);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 110));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 400));
  });

  for (const id of TARGETS) {
    const element = page.locator(`#${id}`);
    if (!(await element.count())) continue;
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await element.screenshot({
      path: `${OUT}/${id}-${locale}-${theme}-${width}.png`
    });
  }

  await context.close();
}

await browser.close();
console.log("section shots written to", OUT);
