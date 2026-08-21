/* Layout shift and painted face, swept across breakpoints.

   This exists because the fix that made `display: swap` viable is fragile in a
   specific way: Hero.module.css reserves space with hard-coded min-block-size
   values, and the number of rows the hero chips settle into differs per locale
   AND per breakpoint, because Arabic and English chip text are different
   lengths. A reservation that is right at 1440 can be wrong at 768.

   So the reservations are not argued for - they are swept. Every combination
   is loaded on a cold cache over Fast 3G, which is the only condition under
   which a late swap happens at all, and each is asserted on two counts:

     - the real face was actually painted, per the renderer's own accounting
       (CSS.getPlatformFontsForNode), not per document.fonts.check(), which
       only reports that a face downloaded
     - the layout shift stayed inside the 0.1 "good" threshold

   Pass a label as argv[2] so local and preview runs can be told apart.
*/
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";

const LABEL = process.argv[2] ?? HOST_LABEL;

await assertProductionBuild(BASE);

/* Chrome DevTools "Fast 3G". */
const FAST_3G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024 * 0.9) / 8,
  uploadThroughput: (750 * 1024 * 0.9) / 8,
  latency: 562.5
};

const LOCALES = [
  ["en", "/", "Inter"],
  ["ar", "/ar", "IBM Plex Sans Arabic"]
];
const WIDTHS = [375, 768, 1024, 1440];

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];

for (const [lang, path, family] of LOCALES) {
  for (const width of WIDTHS) {
    // A fresh context is a cold cache - nothing carries over between runs.
    const context = await browser.newContext({
      extraHTTPHeaders: HEADERS,
      viewport: { width, height: 900 }
    });
    const page = await context.newPage();

    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.clearBrowserCache");
    await cdp.send("Network.emulateNetworkConditions", FAST_3G);

    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 120000 });
    // Long enough for a late swap to happen if the strategy allows one.
    await page.waitForTimeout(4000);

    // Tag the heading text node: CSS.getPlatformFontsForNode returns nothing
    // for a container that owns no text of its own.
    await page.evaluate(() => {
      const n = document.querySelector("h1 span") || document.querySelector("h1");
      if (n) n.id = "__fontprobe";
    });

    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: "#__fontprobe"
    });
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });

    // Rank by glyph count: the face that carried the most glyphs is the face
    // the reader is looking at. Array order carries no such meaning.
    const ranked = [...fonts].sort((a, b) => b.glyphCount - a.glyphCount);
    const totalGlyphs = ranked.reduce((n, f) => n + f.glyphCount, 0);
    const realGlyphs = ranked
      .filter((f) => f.familyName.toLowerCase().includes(family.toLowerCase()))
      .reduce((n, f) => n + f.glyphCount, 0);

    const cls = await page.evaluate(() => window.__cls);

    rows.push({
      host: LABEL,
      lang,
      width,
      CLS: cls.toFixed(4),
      face: ranked[0]?.familyName ?? "(none)",
      "real share": totalGlyphs ? (realGlyphs / totalGlyphs).toFixed(2) : "0.00"
    });

    await context.close();
  }
}

console.log(`\n── ${LABEL} · cold cache · Fast 3G ──`);
console.table(rows);

const bad = rows.filter((r) => Number(r.CLS) > 0.1 || Number(r["real share"]) <= 0.5);
console.log(
  bad.length
    ? `\n${bad.length} breakpoint(s) FAIL (CLS > 0.1, or the real face was not painted)`
    : "\nall breakpoints: real face painted, CLS under 0.1"
);

await browser.close();
process.exit(bad.length ? 1 : 0);
