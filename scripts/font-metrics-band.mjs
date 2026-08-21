/* Which size-adjust values keep the Arabic fallback's line counts identical to
   the real face, at every breakpoint?

   Not "what is the average width ratio" - that question has a tidy answer and
   the wrong one. Line breaking is a step function: a fallback can be 5% too
   wide with no consequence at one width and add a whole line at another. What
   matters is the SET of size-adjust values at which the laid-out hero is the
   same height in the fallback as in the real face, measured per width.

   The probe sets font-family on <body> so it cascades exactly as the real
   stack does, leaving u-mono children on their own family as in production,
   then compares the hero's height against the same page rendered in the real
   face.

   Run this after any change to the Arabic face, its weights or its subsets,
   and put the intersection - or, if empty, the reasoning for the value chosen
   - in the comment above the @font-face rule in app/globals.css.
*/
import { chromium } from "playwright";
import { BASE, HEADERS } from "./_target.mjs";

const browser = await chromium.launch({ channel: "chrome" });
const WIDTHS = [375, 480, 768, 900, 1023, 1024, 1280, 1440];
const bands = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({ extraHTTPHeaders: HEADERS, viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/ar`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.fonts.ready);

  const r = await page.evaluate(async () => {
    const box = [...document.querySelectorAll("div")].find((n) =>
      String(n.className || "").includes("Hero_copy")
    );
    if (!box) return null;
    const real = Math.round(box.getBoundingClientRect().height);
    const body = document.body;
    const prev = body.style.fontFamily;
    const ok = [];
    for (let sa = 96; sa <= 118; sa += 1) {
      const fam = `P${sa}`;
      const ff = new FontFace(fam, 'local("Arial")', {
        sizeAdjust: `${sa}%`,
        ascentOverride: "107.25%",
        descentOverride: "41.02%",
        lineGapOverride: "0%"
      });
      await ff.load();
      document.fonts.add(ff);
      // Set on body so it cascades exactly like the real stack does, leaving
      // u-mono children on their own family just as they are in production.
      body.style.fontFamily = `"${fam}"`;
      void box.offsetHeight;
      if (Math.round(box.getBoundingClientRect().height) === real) ok.push(sa);
    }
    body.style.fontFamily = prev;
    return { real, ok };
  });
  await context.close();
  if (!r) { console.log(`${width}: hero copy not found`); continue; }
  bands.push(r.ok);
  const span = r.ok.length ? `${Math.min(...r.ok)}-${Math.max(...r.ok)}%` : "(none)";
  console.log(`  @${String(width).padEnd(5)} real ${String(r.real).padStart(4)}px   safe band ${span}  (${r.ok.length} values)`);
}

const intersection = bands.reduce((a, b) => a.filter((v) => b.includes(v)));
console.log(`\n  intersection across all widths: ${intersection.length ? intersection.join(", ") : "(EMPTY - no single value works)"}`);
if (intersection.length) {
  const mid = (Math.min(...intersection) + Math.max(...intersection)) / 2;
  console.log(`  midpoint (max margin from both cliffs): ${mid.toFixed(1)}%`);
}
await browser.close();
