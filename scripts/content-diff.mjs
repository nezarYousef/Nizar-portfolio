/* Proves the redesign did not drop content.

   Every human-readable string from the pre-redesign data file (read out of git,
   not the working tree) must appear in the newly rendered page for its own
   language. Rendered text is harvested with all filters reset, with the phone
   revealed, and with every gallery opened in turn - including alt text and
   accessible names that only exist while a dialog is open.

   Excluded, because they are not content: internal ids and CSS-ish values
   (project id, previewFit, imagePosition, lang, dir), asset paths, and the
   removed skill percentages.
*/
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, waitForIntro } from "./_target.mjs";

const BASELINE = process.env.BASELINE_REF ?? "83d21a0";

await assertProductionBuild(BASE);

const NON_CONTENT_KEYS = new Set([
  "id",
  "previewFit",
  "imagePosition",
  "lang",
  "dir",
  "previewImage",
  "src",
  "image",
  "github"
]);

const dir = mkdtempSync(join(tmpdir(), "portfolio-baseline-"));
const oldSource = execFileSync("git", ["show", `${BASELINE}:data/portfolio.js`], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024
});
const oldPath = join(dir, "old-portfolio.mjs");
writeFileSync(oldPath, oldSource);
const { portfolioCopy: oldCopy } = await import(`file://${oldPath}`);

const isAssetOrUrl = (value) =>
  value.startsWith("/") ||
  value.startsWith("http") ||
  value.startsWith("mailto:") ||
  value.startsWith("tel:");

function collectStrings(node, out = [], key = null) {
  if (typeof node === "string") {
    const value = node.trim();
    if (!value) return out;
    if (NON_CONTENT_KEYS.has(key)) return out;
    if (isAssetOrUrl(value)) return out;
    out.push(value);
    return out;
  }
  if (typeof node !== "object" || node === null) return out;
  if (Array.isArray(node)) {
    node.forEach((item) => collectStrings(item, out, key));
    return out;
  }
  Object.entries(node).forEach(([childKey, value]) =>
    collectStrings(value, out, childKey)
  );
  return out;
}

const NBSP = new RegExp(String.fromCharCode(160), "g");

const normalise = (text) =>
  text
    .replace(NBSP, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const browser = await chromium.launch({ channel: "chrome" });

const harvest = async (path) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: HEADERS
  });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  /* A first-visit session plays the one-shot intro behind a full-screen
     overlay; the narrow-viewport drawer click below must happen after its
     hand-over, or it lands on the overlay and the open/close labels read as
     missing. */
  await waitForIntro(page);

  let collectedNarrow = "";
  /* Some labels only exist in a state that only exists on a narrow viewport -
     the mobile menu's open/close names. Visit 375 and open the drawer so they
     are counted too. */
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  const menuButton = page.locator("header button").first();
  if (await menuButton.count()) {
    await menuButton.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(250);
    collectedNarrow = await page.evaluate(() =>
      [...document.querySelectorAll("[aria-label],[title]")]
        .map(
          (el) =>
            `${el.getAttribute("aria-label") ?? ""} ${el.getAttribute("title") ?? ""}`
        )
        .join(" • ")
    );
    await menuButton.click({ timeout: 3000 }).catch(() => {});
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);

  const snapshot = () =>
    page.evaluate(() => {
      const text = document.body.innerText;
      const alt = [...document.querySelectorAll("img")]
        .map((img) => img.alt)
        .join(" • ");
      const names = [...document.querySelectorAll("[aria-label],[title],[alt]")]
        .map(
          (el) =>
            `${el.getAttribute("aria-label") ?? ""} ${el.getAttribute("title") ?? ""}`
        )
        .join(" • ");
      return `${text} • ${alt} • ${names}`;
    });

  let collected = collectedNarrow;

  // Reveal the phone so its label and number are in the DOM.
  const phoneButton = page.locator("#contact button").first();
  if (await phoneButton.count()) {
    await phoneButton.scrollIntoViewIfNeeded();
    await phoneButton.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(150);
  }

/* Waits for the dialog's image count to stop changing rather than pausing a
   fixed 250ms, which is enough on localhost and not against a remote host.

   Be careful with this script's remote numbers. Run against two previews it
   reported 0, 19, 49 and 55 missing strings on builds whose served HTML is
   byte-identical - so its misses are its own, and this settle helper reduced
   the noise without removing it. Opening nine dialogs in two locales over a
   real network has more moving parts than the question deserves.

   For "was anything lost", use scripts/content-html-diff.mjs instead: both
   pages are prerendered, so the served HTML answers it deterministically with
   no browser in the loop. Keep this script for what only a browser can check
   - that each gallery actually opens and mounts the images it claims. */
async function settleDialog(page, { quietFor = 2, capMs = 6000 } = {}) {
  const started = Date.now();
  let last = -1;
  let stable = 0;

  while (Date.now() - started < capMs) {
    const count = await page
      .locator('[role="dialog"] img')
      .count()
      .catch(() => -1);
    stable = count === last && count > 0 ? stable + 1 : 0;
    if (stable >= quietFor) return count;
    last = count;
    await page.waitForTimeout(150);
  }
  return last;
}

  // Open each gallery. Filter buttons live in a role=group and are skipped -
  // clicking one hides rows and would make the whole harvest lie.
  const triggers = await page
    .locator('#projects button:not([role="group"] button)')
    .all();

  for (const trigger of triggers) {
    try {
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click({ timeout: 2500 });
      await page.waitForSelector('[role="dialog"]', { timeout: 2500 });
      await settleDialog(page);
      collected += " " + (await snapshot());
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    } catch {
      /* button did not open a dialog */
    }
  }

  // Final pass with nothing filtered and no dialog open.
  collected += " " + (await snapshot());

  await page.close();
  return normalise(collected);
};

let failures = 0;
const summary = [];

for (const [lang, path] of [
  ["en", "/"],
  ["ar", "/ar"]
]) {
  const strings = [...new Set(collectStrings(oldCopy[lang]))];
  const haystack = await harvest(path);
  const missing = strings.filter((s) => !haystack.includes(normalise(s)));

  summary.push({ lang, checked: strings.length, missing: missing.length });
  console.log(`\n── ${lang.toUpperCase()} (${path}) ──`);
  console.log(`  baseline strings checked: ${strings.length}`);
  console.log(`  present in new render:    ${strings.length - missing.length}`);
  if (missing.length) {
    console.log(`  MISSING (${missing.length}):`);
    missing.forEach((s) => console.log(`    - ${s.slice(0, 120)}`));
  }
  failures += missing.length;
}

await browser.close();
console.table(summary);
console.log(failures ? `\n${failures} missing string(s)` : "\nno content lost");
process.exit(failures ? 1 : 0);
