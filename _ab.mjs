import { chromium } from "playwright";
import { BASE, HEADERS } from "./scripts/_target.mjs";

const RUNS = 3;
const browser = await chromium.launch({ channel: "chrome" });

async function once(override, path, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 1024 }, extraHTTPHeaders: HEADERS });
  const page = await ctx.newPage();
  await page.route(/vercel\.live|_next-live/, (r) => r.abort());
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375
  });

  /* An inline style on <html> beats any stylesheet rule of equal specificity,
     which a late-loading globals.css does not. The previous attempt injected a
     <style> element and was silently overridden. */
  if (override) {
    await page.addInitScript(() => {
      const apply = () => {
        document.documentElement.style.setProperty("--measure", "42em");
        document.documentElement.style.setProperty("--measure-narrow", "34em");
      };
      apply();
      document.addEventListener("readystatechange", apply);
      new MutationObserver(apply).observe(document.documentElement, { childList: true });
    });
  }

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__widths = new Set();
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    const tick = () => {
      const d = document.querySelector('[class*="Hero_description"]');
      if (d) window.__widths.add(Math.round(d.getBoundingClientRect().width));
      if (performance.now() < 11000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(11500);
  const r = await page.evaluate(() => ({
    cls: window.__cls,
    widths: [...window.__widths],
    measure: getComputedStyle(document.documentElement).getPropertyValue("--measure").trim()
  }));
  await ctx.close();
  return r;
}

for (const [label, override] of [["68ch (current)", false], ["42em (candidate)", true]]) {
  for (const [lang, path] of [["ar", "/ar"], ["en", "/"]]) {
    const runs = [];
    let widths = null, measure = null;
    for (let i = 0; i < RUNS; i += 1) {
      const r = await once(override, path, 768);
      runs.push(r.cls);
      widths = r.widths; measure = r.measure;
    }
    const med = [...runs].sort((a, b) => a - b)[Math.floor(RUNS / 2)];
    console.log(
      `${label.padEnd(17)} ${lang} @768  median ${med.toFixed(4)}  ` +
      `runs ${runs.map((c) => c.toFixed(4)).join("/")}  descW ${widths.join(",")}  --measure ${measure}`
    );
  }
}
await browser.close();
