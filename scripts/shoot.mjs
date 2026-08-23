/* Screenshots every breakpoint x theme x locale combination against the
   production server. Scrolls the whole page first so scroll-reveals have
   fired before the full-page capture - otherwise every section below the
   fold photographs at opacity 0. */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
/* _target.mjs carries the deployment-protection bypass header. Without it a
   preview answers every navigation with the Vercel SSO page, and this script
   photographs the login screen while reporting success. */
import { BASE, HEADERS, waitForIntro } from "./_target.mjs";

await assertProductionBuild(BASE);
const OUT = process.env.SHOOT_OUT ?? "screenshots";

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 }
];
const THEMES = ["light", "dark"];
const LOCALES = [
  { name: "en", path: "/" },
  { name: "ar", path: "/ar" }
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const results = [];

for (const locale of LOCALES) {
  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        extraHTTPHeaders: HEADERS
      });

      // Set the stored theme before any script runs, exactly like a returning
      // visitor - this also exercises the pre-paint theme script.
      await context.addInitScript((value) => {
        localStorage.setItem("nizar-portfolio-theme", value);
      }, theme);

      const page = await context.newPage();

      /* Vercel injects a feedback widget into preview deployments which holds
         a websocket open, so networkidle never fires and every navigation
         times out at 30s. It does not exist on production, so blocking it
         makes the preview behave like the real site rather than papering over
         the wait condition. */
      await page.route(/vercel\.live|_next-live/, (route) => route.abort());

      const errors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (error) => errors.push(String(error)));

      await page.goto(`${BASE}${locale.path}`, { waitUntil: "networkidle" });
      /* The one-shot intro holds the page behind an overlay for its first
         seconds; wait it out so reveals and captures photograph the site. */
      await waitForIntro(page);

      /* Trigger every reveal, then return to the top. `behavior: instant` is
         essential: the page sets scroll-behavior: smooth, and successive
         smooth scrollTo calls interrupt each other so the page never actually
         reaches the bottom. */
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.5);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
        await new Promise((resolve) => setTimeout(resolve, 400));
      });

      const stillHidden = await page.evaluate(
        () =>
          [...document.querySelectorAll('[data-armed="true"]')].filter(
            (node) => getComputedStyle(node).opacity === "0"
          ).length
      );

      await page.waitForTimeout(500);

      const appliedTheme = await page.evaluate(
        () => document.documentElement.dataset.theme
      );
      const dir = await page.evaluate(() => document.documentElement.dir);

      const file = `${OUT}/${locale.name}-${theme}-${viewport.name}.png`;
      await page.screenshot({ path: file, fullPage: true });

      results.push({
        file,
        locale: locale.name,
        theme,
        width: viewport.name,
        appliedTheme,
        dir,
        stillHidden,
        errors: errors.length
      });

      if (errors.length) {
        console.log(`  console errors on ${file}:`);
        errors.slice(0, 4).forEach((error) => console.log(`    ${error}`));
      }

      await context.close();
    }
  }
}

await browser.close();

console.table(results);
