import { chromium } from "playwright";
import { BASE, HEADERS, waitForIntro } from "./scripts/_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/`, { waitUntil: "networkidle", headers: HEADERS });
await waitForIntro(page);
await page.waitForTimeout(800);

/* Instrument: record every pointermove's viewport coords, then compare the
   rendered dot/ring centres against the LAST event coords. */
await page.evaluate(() => {
  window.__mouse = { x: null, y: null };
  document.addEventListener("pointermove", (e) => {
    window.__mouse.x = e.clientX;
    window.__mouse.y = e.clientY;
  }, { passive: true });
});

const suspicious = await page.evaluate(() => {
  const pick = (el) => {
    const s = window.getComputedStyle(el);
    return {
      transform: s.transform,
      perspective: s.perspective,
      filter: s.filter,
      backdropFilter: s.backdropFilter,
      zoom: s.zoom,
      contain: s.contain,
      willChange: s.willChange,
      position: s.position
    };
  };
  const dot = document.querySelector("[class*='Cursor_dot']");
  const chain = [];
  let el = dot?.parentElement;
  while (el) { chain.push(`${el.tagName}.${String(el.className).slice(0, 40)}:${JSON.stringify(pick(el))}`); el = el.parentElement; }
  return chain;
});
console.log("ancestor-chain-of-cursor:");
suspicious.forEach((line) => console.log(" ", line.slice(0, 220)));

const probe = async (label) => {
  const r = await page.evaluate(() => {
    const d = document.querySelector("[class*='Cursor_dot']")?.getBoundingClientRect();
    const g = document.querySelector("[class*='Cursor_ring']")?.getBoundingClientRect();
    const dc = d ? { x: +(d.x + d.width / 2).toFixed(1), y: +(d.y + d.height / 2).toFixed(1) } : null;
    const gc = g ? { x: +(g.x + g.width / 2).toFixed(1), y: +(g.y + g.height / 2).toFixed(1) } : null;
    const el = document.elementFromPoint(window.__mouse.x, window.__mouse.y);
    return {
      mouse: { x: window.__mouse.x, y: window.__mouse.y },
      dotCenter: dc,
      ringCenter: gc,
      underPointer: el ? `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0].slice(0, 30) : ""}` : "(none)",
      scrollY: window.scrollY
    };
  });
  const dm = r.dotCenter ? `${(r.dotCenter.x - r.mouse.x).toFixed(1)},${(r.dotCenter.y - r.mouse.y).toFixed(1)}` : "n/a";
  const gm = r.ringCenter ? `${(r.ringCenter.x - r.mouse.x).toFixed(1)},${(r.ringCenter.y - r.mouse.y).toFixed(1)}` : "n/a";
  console.log(`${label}: dot-offset=(${dm}) ring-offset=(${gm}) under=${r.underPointer} scrollY=${r.scrollY}`);
};

/* 1. centre of viewport */
await page.mouse.move(720, 450, { steps: 12 });
await page.waitForTimeout(700);
await probe("centre");

/* 2. over a nav link */
await page.mouse.move(576, 32, { steps: 10 });
await page.waitForTimeout(700);
await probe("nav-link");

/* 3. near right edge */
await page.mouse.move(1434, 890, { steps: 10 });
await page.waitForTimeout(700);
await probe("bottom-right-edge");

/* 4. near left edge */
await page.mouse.move(6, 300, { steps: 10 });
await page.waitForTimeout(700);
await probe("left-edge");

/* 5. scroll down 1200px then probe same spot */
await page.mouse.move(400, 400, { steps: 6 });
await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
await page.waitForTimeout(500);
await page.mouse.move(401, 401, { steps: 4 });
await page.waitForTimeout(700);
await probe("after-scroll");

/* 6. click accuracy: click the theme toggle by raw coords and confirm IT received the click */
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(400);
const toggle = page.locator("header button").last();
const tb = await toggle.boundingBox();
if (tb) {
  const cx = tb.x + tb.width / 2;
  const cy = tb.y + tb.height / 2;
  await page.mouse.move(cx, cy, { steps: 8 });
  await page.waitForTimeout(600);
  const clickedSelf = await page.evaluate(([x, y]) => {
    let hit = null;
    const handler = (e) => { hit = `${e.target.tagName.toLowerCase()}.${String(e.target.className).slice(0, 20)}`; };
    document.addEventListener("click", handler, { capture: true, once: true });
    return new Promise((resolve) => setTimeout(() => resolve({ hit }), 50));
  }, [cx, cy]);
  console.log("pre-click-check:", JSON.stringify(clickedSelf), "target-box:", JSON.stringify(tb));
}

await browser.close();
