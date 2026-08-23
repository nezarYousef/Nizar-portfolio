import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/`, { waitUntil: "networkidle", headers: HEADERS });
await waitForIntro(page);
await page.waitForTimeout(600);

const info = await page.evaluate(() => {
  const dot = document.querySelector("[class*='Cursor_dot']");
  const ring = document.querySelector("[class*='Cursor_ring']");
  if (!dot) return { found: false };
  const s = window.getComputedStyle(dot);
  const g = window.getComputedStyle(ring);
  let sheetHasRules = null;
  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules;
      for (const r of rules) {
        if (r.selectorText && r.selectorText.includes("Cursor_dot")) {
          sheetHasRules = r.cssText.slice(0, 200);
          break;
        }
      }
    } catch {
      /* cross-origin */
    }
    if (sheetHasRules) break;
  }
  return {
    found: true,
    dotClass: dot.className,
    position: s.position,
    display: s.display,
    transform: s.transform,
    width: s.width,
    top: s.top,
    left: s.left,
    zIndex: s.zIndex,
    pointerEvents: s.pointerEvents,
    ringPosition: g.position,
    ringTransform: g.transform,
    ruleInSheet: sheetHasRules
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
