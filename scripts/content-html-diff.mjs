/* Proves no content was lost between two builds, deterministically.

   Both locales are statically prerendered, so every string the server emits
   for a given commit is fixed. Comparing two deployments' HTML therefore
   answers "did anything disappear" exactly, with no browser, no network
   timing and no run-to-run variance.

   That matters because the browser-driven check could not answer it. Run
   against the same pair of previews, scripts/content-diff.mjs reported 0, 19,
   49 and 55 missing strings on builds this script shows to be identical - it
   was measuring how many dialogs happened to finish mounting inside its
   timeouts. Use that script for what needs a browser (does each gallery open,
   does it mount the images it advertises) and this one for the content
   question.

   What it cannot see, by construction: anything a client component adds after
   hydration. The gallery modals are the only such content here, and
   content-diff.mjs covers them.

   Usage: node scripts/content-html-diff.mjs <baseline-url> <candidate-url>
*/
import { existsSync, readFileSync } from "node:fs";

const [BASELINE, CANDIDATE] = process.argv.slice(2);
if (!BASELINE || !CANDIDATE) {
  console.error(
    "usage: node scripts/content-html-diff.mjs <baseline-url> <candidate-url>"
  );
  process.exit(1);
}

const secret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET ??
  (existsSync(".env.local")
    ? (readFileSync(".env.local", "utf8").match(
        /^VERCEL_AUTOMATION_BYPASS_SECRET=(.*)$/m
      ) ?? [])[1]?.trim()
    : undefined);

const headers = (base) =>
  secret && !/localhost|127\.0\.0\.1/.test(base)
    ? { "x-vercel-protection-bypass": secret }
    : {};

/* Every user-visible string: rendered text plus the attributes that carry
   content rather than markup. Script and style bodies are dropped - the RSC
   payload repeats the copy in a form that would double-count it, and the
   build id changes on every deploy. */
async function harvest(base, path) {
  const res = await fetch(base + path, { headers: headers(base) });
  if (!res.ok) throw new Error(`${base}${path} -> ${res.status}`);
  const html = await res.text();

  const strings = new Set();
  for (const m of html.matchAll(/(?:alt|aria-label|title)="([^"]{2,})"/g)) {
    strings.add(m[1]);
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, "\n");

  for (const line of text.split("\n")) {
    const s = line.trim();
    if (s.length > 2 && !/^[{}[\],:"]/.test(s)) strings.add(s);
  }
  return strings;
}

const rows = [];
let lostTotal = 0;

for (const path of ["/", "/ar"]) {
  const [before, after] = await Promise.all([
    harvest(BASELINE, path),
    harvest(CANDIDATE, path)
  ]);

  const lost = [...before].filter((s) => !after.has(s));
  const gained = [...after].filter((s) => !before.has(s));
  lostTotal += lost.length;

  rows.push({
    page: path,
    baseline: before.size,
    candidate: after.size,
    lost: lost.length,
    gained: gained.length
  });

  for (const s of lost) console.log(`  LOST   ${path}  ${s.slice(0, 110)}`);
  for (const s of gained) console.log(`  GAINED ${path}  ${s.slice(0, 110)}`);
}

console.table(rows);
console.log(
  lostTotal
    ? `${lostTotal} string(s) lost`
    : "no content lost in either language"
);

process.exitCode = lostTotal ? 1 : 0;
