/* Repeat one breakpoint and name what moved.

   cls-sweep answers "is any breakpoint over the line" in one pass per cell,
   which is the right shape for a gate but the wrong shape for a diagnosis: a
   single sample cannot tell a stable 0.06 from a 0.13 that landed on its good
   run. This runs one cell N times and reports every run, plus the elements
   that moved and how their box changed, so a number leads to a cause.

   Usage: node scripts/cls-probe.mjs <lang> <width> [runs]
*/
import { chromium } from "playwright";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";

const LANG = process.argv[2] ?? "ar";
const WIDTH = Number(process.argv[3] ?? 768);
const RUNS = Number(process.argv[4] ?? 5);
const PATH = LANG === "ar" ? "/ar" : "/";

const FAST_3G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024 * 0.9) / 8,
  uploadThroughput: (750 * 1024 * 0.9) / 8,
  latency: 562.5
};

const browser = await chromium.launch({ channel: "chrome" });
const totals = [];
let worst = { cls: -1, sources: [] };

for (let i = 0; i < RUNS; i += 1) {
  const context = await browser.newContext({
    extraHTTPHeaders: HEADERS,
    viewport: { width: WIDTH, height: 900 }
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Network.emulateNetworkConditions", FAST_3G);

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__src = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__cls += e.value;
        for (const s of e.sources || []) {
          const n = s.node;
          if (!n) continue;
          window.__src.push({
            value: Number(e.value.toFixed(4)),
            at: Math.round(e.startTime),
            tag: n.tagName?.toLowerCase(),
            cls: String(n.className || "").split(" ")[0].slice(0, 30),
            prevH: s.previousRect ? Math.round(s.previousRect.height) : null,
            curH: s.currentRect ? Math.round(s.currentRect.height) : null,
            prevY: s.previousRect ? Math.round(s.previousRect.y) : null,
            curY: s.currentRect ? Math.round(s.currentRect.y) : null
          });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(`${BASE}${PATH}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(6000);

  const { cls, src } = await page.evaluate(() => ({ cls: window.__cls, src: window.__src }));
  totals.push(cls);
  if (cls > worst.cls) worst = { cls, sources: src };
  await context.close();
}

const sorted = [...totals].sort((a, b) => a - b);
console.log(
  `\n${HOST_LABEL} · ${LANG} @${WIDTH} · cold cache · Fast 3G · ${RUNS} runs\n` +
    `  runs   ${totals.map((t) => t.toFixed(4)).join("  ")}\n` +
    `  median ${sorted[Math.floor(sorted.length / 2)].toFixed(4)}   worst ${Math.max(...totals).toFixed(4)}   best ${Math.min(...totals).toFixed(4)}`
);

if (worst.sources.length) {
  console.log(`\n  what moved on the worst run (${worst.cls.toFixed(4)}):`);
  worst.sources
    .filter((s) => s.value >= 0.005)
    .forEach((s) =>
      console.log(
        `    ${String(s.value).padStart(7)} @${String(s.at).padStart(5)}ms  <${s.tag}> ${s.cls}` +
          `   y ${s.prevY}->${s.curY}  h ${s.prevH}->${s.curH}`
      )
    );
}
await browser.close();
