/* Does the real face actually render, and does it cost a layout shift?

   Both halves of that question have to be answered on a COLD cache over a
   THROTTLED network, because that is the only condition where they diverge.
   On a warm localhost cache every strategy looks identical and perfect.

   Each measurement gets a brand-new browser context (empty HTTP cache, empty
   font cache) and Chrome's Fast 3G profile applied over CDP before the first
   byte. We then report, per locale:

     - which family actually rendered, decided by measuring text width against
       the real family and against next/font's generated fallback rather than
       by trusting document.fonts.check()
     - the layout shift that accumulated
     - first contentful paint

   Pass a label as argv[2] so runs can be told apart in the log.
*/
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";


await assertProductionBuild(BASE);
const LABEL = process.argv[2] ?? HOST_LABEL;
const RUNS = Number(process.env.FONT_RUNS ?? 3);

/* Chrome DevTools "Fast 3G". */
const FAST_3G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024 * 0.9) / 8,
  uploadThroughput: (750 * 1024 * 0.9) / 8,
  latency: 562.5
};

const TARGETS = [
  ["en", "/", "Inter"],
  ["ar", "/ar", "IBM Plex Sans Arabic"]
];

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

for (const [lang, path, family] of TARGETS) {
  const samples = [];

  for (let run = 0; run < RUNS; run += 1) {
    // A fresh context is a cold cache - nothing is carried over between runs.
    const context = await browser.newContext({
      extraHTTPHeaders: HEADERS,
      viewport: { width: 1350, height: 900 }
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
    await page.waitForTimeout(6000);

    const result = await page.evaluate((fam) => {
      /* Neither document.fonts.check() nor a bare canvas probe answers the
         question. Both report that the face is LOADED - and with
         display:optional Chrome deliberately keeps downloading the face in
         the background for the next navigation even when it refused to use
         it for this paint. So both would say "real face" while the reader is
         looking at Arial.

         Measure what was actually painted instead: take the real rendered
         width of a live text node, then ask canvas how wide that same string
         would be in the real family and in next/font's generated fallback,
         and see which one the DOM matches. */
      /* Pick the longest single-line-measurable run of text on the page. A
         short heading is useless here: in Arabic the h1 measured 353px in the
         real face and 355px in the fallback, a 2px gap that no amount of
         care can resolve. The longer the string, the further apart the two
         candidates are, and the more decisive the comparison. */
      const candidates = [...document.querySelectorAll("h1 span, h1, p, li, h2, h3")]
        .filter((n) => n.childNodes.length === 1 && n.firstChild?.nodeType === 3)
        .map((n) => ({ n, len: n.textContent.trim().length }))
        .sort((a, b) => b.len - a.len);
      const el = candidates[0]?.n;
      if (!el) return { unmeasurable: true };
      // Tag it so the CDP font query below can address this exact node.
      el.id = el.id || "__fontprobe";

      const cs = getComputedStyle(el);
      const text = el.textContent;

      const range = document.createRange();
      range.selectNodeContents(el);
      // The text may wrap; sum the line boxes so the total advance is compared.
      const painted = [...range.getClientRects()].reduce((sum, r) => sum + r.width, 0);

      // letter-spacing is applied by layout but not by measureText, so add it
      // to each candidate rather than hoping it cancels out.
      const spacing = parseFloat(cs.letterSpacing);
      const extra = Number.isFinite(spacing) ? spacing * text.length : 0;

      const probe = (family) => {
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${family}`;
        return ctx.measureText(text).width + extra;
      };
      const real = probe(`"${fam}"`);
      const fallback = probe(`"${fam} Fallback"`);

      const fcp = performance.getEntriesByName("first-contentful-paint")[0];
      return {
        cls: window.__cls,
        // Nearest match wins; letter-spacing offsets both candidates equally.
        usedReal: Math.abs(painted - real) <= Math.abs(painted - fallback),
        separable: Math.abs(real - fallback) > 12,
        painted: Math.round(painted),
        realW: Math.round(real),
        fallbackW: Math.round(fallback),
        loaded: document.fonts.check(`${cs.fontSize} "${fam}"`),
        fcp: fcp ? Math.round(fcp.startTime) : null
      };
    }, family);

    /* The authoritative answer. Canvas probes proved unreliable in both
       directions: measureText silently substitutes a default face when the
       requested family is not loaded, so real and fallback collapsed to within
       1px of each other on one build and were 286px apart on the next, for the
       same page. CSS.getPlatformFontsForNode asks the renderer which physical
       fonts it actually used for the glyphs it painted. It has to be pointed at
       a node that owns text - a container returns nothing. */
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: "#__fontprobe"
    });
    const { fonts: platformFonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    const ranked = [...platformFonts].sort((a, b) => b.glyphCount - a.glyphCount);

    // Which physical face carried the most glyphs on that text.
    const dominant = ranked[0]?.familyName ?? "(none)";
    const realGlyphs = ranked
      .filter((f) => f.familyName.toLowerCase().includes(family.toLowerCase()))
      .reduce((n, f) => n + f.glyphCount, 0);
    const totalGlyphs = ranked.reduce((n, f) => n + f.glyphCount, 0);

    samples.push({
      ...result,
      dominant,
      realShare: totalGlyphs ? realGlyphs / totalGlyphs : 0,
      fontList: ranked.map((f) => `${f.familyName}:${f.glyphCount}`).join(", ")
    });
    await context.close();
  }

  // "Painted" means the renderer attributed the majority of glyphs to it.
  const paintedCount = samples.filter((s) => s.realShare > 0.5).length;
  const loadedCount = samples.filter((s) => s.loaded).length;
  console.log(`  ${lang}: fonts used -> ${samples[0].fontList}`);
  rows.push({
    variant: LABEL,
    locale: lang,
    "PAINTED with real face": `${paintedCount}/${RUNS}`,
    "merely downloaded": `${loadedCount}/${RUNS}`,
    "dominant face": samples[0].dominant,
    "CLS median": median(samples.map((s) => s.cls)).toFixed(4),
    "CLS worst": Math.max(...samples.map((s) => s.cls)).toFixed(4),
    "FCP median ms": Math.round(median(samples.map((s) => s.fcp ?? 0)))
  });
}

console.log(`\n── ${LABEL} · cold cache · Fast 3G · ${RUNS} runs per locale ──`);
console.table(rows);

await browser.close();
