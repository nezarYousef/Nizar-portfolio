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

const BASELINE = process.env.BASELINE_REF ?? "83d21a0";
const BASE = process.env.SHOOT_BASE ?? "http://localhost:4321";

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

const normalise = (text) =>
  text
    .replace(/ /g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const browser = await chromium.launch({ channel: "chrome" });

const harvest = async (path) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

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

  let collected = "";

  // Reveal the phone so its label and number are in the DOM.
  const phoneButton = page.locator("#contact button").first();
  if (await phoneButton.count()) {
    await phoneButton.scrollIntoViewIfNeeded();
    await phoneButton.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(150);
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
      await page.waitForTimeout(250);
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
