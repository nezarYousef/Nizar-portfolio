/* Sample every box in the hero through the whole load.

   Before/after snapshots cannot see the states that actually cause layout
   shift here. Twice now the culprit has been a state that existed for ~150ms
   and then vanished, with the two endpoints identical - once a paragraph
   rendered half in IBM Plex and half in Arial while their subsets raced, once
   a container that briefly gained a row. A diff of the settled states reports
   "nothing changed" for both.

   So: poll every element under the hero at ~80ms and print only the moments
   something moved, with the element's own class name. That turns "CLS is
   0.1279" into "this element, at this millisecond, by this many pixels".

   Usage: node scripts/hero-timeline.mjs <lang> <width>
*/
import { chromium } from "playwright";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";

const LANG = process.argv[2] ?? "en";
const WIDTH = Number(process.argv[3] ?? 480);
const PATH = LANG === "ar" ? "/ar" : "/";

const FAST_3G = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024 * 0.9) / 8,
  uploadThroughput: (750 * 1024 * 0.9) / 8,
  latency: 562.5
};

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  extraHTTPHeaders: HEADERS,
  viewport: { width: WIDTH, height: 900 }
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.clearBrowserCache");
await cdp.send("Network.emulateNetworkConditions", FAST_3G);

const arrivals = [];
page.on("response", (r) => {
  if (/\.(woff2|css|js)(\?|$)/.test(r.url())) {
    arrivals.push({ t: Date.now(), name: r.url().split("/").pop().slice(0, 44) });
  }
});

await page.addInitScript(() => {
  window.__rows = [];
  const t0 = performance.now();
  const tick = () => {
    const hero =
      document.querySelector('[class*="Hero_hero"]') ||
      document.querySelector("main > section");
    const row = { t: Math.round(performance.now()) };
    if (hero) {
      const hr = hero.getBoundingClientRect();
      row["#hero"] = `${Math.round(hr.y)}/${Math.round(hr.height)}`;
      for (const n of hero.querySelectorAll("*")) {
        const r = n.getBoundingClientRect();
        if (r.height === 0 && r.width === 0) continue;
        const key = String(n.className || "").split(" ")[0].replace(/^Hero_/, "").slice(0, 20) || n.tagName.toLowerCase();
        if (!row[key]) row[key] = `${Math.round(r.y)}/${Math.round(r.height)}`;
      }
    }
    window.__rows.push(row);
    if (performance.now() - t0 < 7000) setTimeout(tick, 80);
  };
  tick();
});

await page.goto(`${BASE}${PATH}`, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(7500);

const rows = await page.evaluate(() => window.__rows);
const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => k !== "t");

console.log(`\n${HOST_LABEL} · ${LANG} @${WIDTH} · values are y/height, printed only when something changed\n`);
let prev = null;
for (const r of rows) {
  const sig = keys.map((k) => r[k] ?? "-").join("|");
  if (sig === prev) continue;
  const changed = prev
    ? keys.filter((k, i) => (prev.split("|")[i] ?? "-") !== (r[k] ?? "-"))
    : keys;
  console.log(
    `  ${String(r.t).padStart(5)}ms  ` +
      changed.slice(0, 8).map((k) => `${k}:${r[k] ?? "-"}`).join("  ")
  );
  prev = sig;
}

const t0 = arrivals.length ? arrivals[0].t : 0;
console.log("\n  resource arrivals (ms after first):");
arrivals.slice(0, 18).forEach((a) => console.log(`    ${String(a.t - t0).padStart(5)}  ${a.name}`));

await browser.close();
