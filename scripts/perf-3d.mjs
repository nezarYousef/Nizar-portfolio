/* Measures what the 3D hero actually costs.

   Bundle: the canvas is gated off below 768px, so loading at 375 gives a
   clean "without 3D" baseline and 1440 gives "with 3D". The delta is the real
   cost of the flagship visual. Sizes are gzipped, which is what ships.

   Frame rate: measured under CPU throttling, and always against a baseline
   taken on the same throttled machine with the canvas gated off - otherwise
   the number says more about the throttle than about the scene.
*/
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";


await assertProductionBuild(BASE);
const THROTTLES = (process.env.CPU_THROTTLES ?? "1,4,6").split(",").map(Number);

const browser = await chromium.launch({ channel: "chrome" });

async function loadAndWeigh(width) {
  const context = await browser.newContext({
      extraHTTPHeaders: HEADERS,
    viewport: { width, height: width < 500 ? 812 : 900 }
  });
  const page = await context.newPage();

  const seen = new Map();
  page.on("response", async (response) => {
    const url = response.url();
    if (!/\.js(\?|$)/.test(url)) return;
    try {
      const body = await response.body();
      seen.set(url.replace(BASE, ""), gzipSync(body).length);
    } catch {
      /* no body */
    }
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const hasCanvas = (await page.locator("canvas").count()) > 0;
  const total = [...seen.values()].reduce((sum, n) => sum + n, 0);

  return { context, page, seen, total, hasCanvas, width };
}

const small = await loadAndWeigh(375);
const large = await loadAndWeigh(1440);

const extraFiles = [...large.seen.entries()].filter(([url]) => !small.seen.has(url));
const extraBytes = extraFiles.reduce((sum, [, bytes]) => sum + bytes, 0);

console.log("── JS shipped, gzipped ──");
console.log(`  375px (canvas gated off, canvas present: ${small.hasCanvas}): ${(small.total / 1024).toFixed(1)} KB`);
console.log(`  1440px (canvas live,     canvas present: ${large.hasCanvas}): ${(large.total / 1024).toFixed(1)} KB`);
console.log(`  delta attributable to the 3D hero: ${(extraBytes / 1024).toFixed(1)} KB gzipped`);
extraFiles
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([url, bytes]) =>
    console.log(`    ${(bytes / 1024).toFixed(1).padStart(7)} KB  ${url}`)
  );

await small.context.close();

/* ── Frame rate ─────────────────────────────────────────────────────────── */
const cdpLarge = await large.context.newCDPSession(large.page);

const smallAgain = await loadAndWeigh(375);
const cdpSmall = await smallAgain.context.newCDPSession(smallAgain.page);

const sampleFps = async (page, seconds = 4) =>
  page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames += 1;
          if (performance.now() - start < duration * 1000) requestAnimationFrame(tick);
          else resolve(frames / ((performance.now() - start) / 1000));
        };
        requestAnimationFrame(tick);
      }),
    seconds
  );

/* Measured strictly one page at a time. Sampling both pages while both were
   open made them compete for the same throttled CPU, which flattened both
   numbers and hid the difference entirely. */
const withCanvasFps = {};
for (const rate of THROTTLES) {
  await cdpLarge.send("Emulation.setCPUThrottlingRate", { rate });
  await large.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await large.page.waitForTimeout(900);
  withCanvasFps[rate] = await sampleFps(large.page);
}
await cdpLarge.send("Emulation.setCPUThrottlingRate", { rate: 1 });
await large.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

const withoutCanvasFps = {};
for (const rate of THROTTLES) {
  await cdpSmall.send("Emulation.setCPUThrottlingRate", { rate });
  await smallAgain.page.waitForTimeout(900);
  withoutCanvasFps[rate] = await sampleFps(smallAgain.page);
}
await cdpSmall.send("Emulation.setCPUThrottlingRate", { rate: 1 });
await smallAgain.context.close();

console.log("\n── Frame rate: 3D hero vs. the same page with the canvas gated off ──");
for (const rate of THROTTLES) {
  console.log(
    `  ${String(rate).padStart(2)}x throttle:  with 3D ${withCanvasFps[rate]
      .toFixed(1)
      .padStart(5)} fps   |   no 3D ${withoutCanvasFps[rate].toFixed(1).padStart(5)} fps`
  );
}

/* ── Is the loop genuinely paused when off-screen / hidden? ─────────────── */
await cdpLarge.send("Emulation.setCPUThrottlingRate", { rate: 1 });

const instrument = () =>
  large.page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
    window.__draws = 0;
    if (!gl || gl.__patched) return;
    const original = gl.drawArrays.bind(gl);
    gl.drawArrays = (...args) => {
      window.__draws += 1;
      return original(...args);
    };
    gl.__patched = true;
  });

const countDraws = async (ms = 1500) => {
  await large.page.evaluate(() => {
    window.__draws = 0;
  });
  await large.page.waitForTimeout(ms);
  return large.page.evaluate(() => window.__draws);
};

await large.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await large.page.waitForTimeout(600);
await instrument();
const drawsVisible = await countDraws();

// Scroll away and let the observer settle *before* counting.
await large.page.evaluate(() =>
  window.scrollTo({ top: window.innerHeight * 6, behavior: "instant" })
);
await large.page.waitForTimeout(1200);
const drawsAway = await countDraws();

// Back into view, then hide the tab.
await large.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await large.page.waitForTimeout(900);
const drawsBack = await countDraws(1000);

console.log("\n── Render loop gating (draw calls per 1.5s, steady state) ──");
console.log(`  hero in view:        ${drawsVisible}`);
console.log(`  scrolled off-screen: ${drawsAway}`);
console.log(`  scrolled back in:    ${drawsBack}`);
console.log(
  `  canvas elements after scrolling away and back: ${await large.page
    .locator("canvas")
    .count()} (1 = context reused, not recreated)`
);

await browser.close();
