/* Lighthouse, run on Google's infrastructure instead of this laptop.

   Local Lighthouse could not produce a trustworthy performance number here.
   Two causes, one fixed and one not: Lighthouse leaks its Chrome on Windows so
   long sequences poisoned themselves (fixed in lighthouse-runs.mjs), and the
   machine is a working laptop - an editor, two browsers, thousands of seconds
   of accumulated CPU. Simulated throttling cannot compensate for a host that
   busy, and runs swung between 39 and 93 with no relation to the site.

   PageSpeed Insights runs the same Lighthouse on Google's servers, so none of
   that applies. It is also closer to the question actually being asked: what a
   recruiter's own PageSpeed check would say.

   The preview sits behind Vercel Authentication, which PSI cannot authenticate
   to, so the bypass secret is passed as a query parameter - the documented
   method for clients that cannot set headers. That does send the secret to a
   third party, so ROTATE IT AFTERWARDS. Against production, where there is no
   protection, leave the secret unset and none is sent.

   Usage: PSI_RUNS=3 node scripts/psi.mjs <base-url>
*/
import { existsSync, readFileSync } from "node:fs";

const BASE = process.argv[2] ?? process.env.SHOOT_BASE;
if (!BASE) {
  console.error("usage: node scripts/psi.mjs <base-url>");
  process.exit(1);
}
const RUNS = Number(process.env.PSI_RUNS ?? 3);

const secret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET ??
  (existsSync(".env.local")
    ? (readFileSync(".env.local", "utf8").match(
        /^VERCEL_AUTOMATION_BYPASS_SECRET=(.*)$/m
      ) ?? [])[1]?.trim()
    : undefined);

const target = (path) => {
  const url = new URL(path, BASE);
  if (secret && !/localhost/.test(BASE)) {
    url.searchParams.set("x-vercel-protection-bypass", secret);
    url.searchParams.set("x-vercel-set-bypass-cookie", "true");
  }
  return url.toString();
};

const COMBOS = [
  ["en mobile", "/", "mobile"],
  ["en desktop", "/", "desktop"],
  ["ar mobile", "/ar", "mobile"],
  ["ar desktop", "/ar", "desktop"]
];

const median = (xs) => {
  const s = [...xs].filter((v) => typeof v === "number").sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2
    ? s[Math.floor(s.length / 2)]
    : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

const fmt = (v) => (typeof v === "number" ? Math.round(v) : "-");
const rows = [];

for (const [label, path, strategy] of COMBOS) {
  const runs = [];

  for (let i = 0; i < RUNS; i += 1) {
    const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    api.searchParams.set("url", target(path));
    api.searchParams.set("strategy", strategy);
    /* Without a key, PSI uses an anonymous quota shared by every keyless
       caller on the internet, which is routinely exhausted - the first attempt
       here failed on it for all four combos. A free key from
       https://developers.google.com/speed/docs/insights/v5/get-started gives
       this project its own quota. */
    if (process.env.PSI_API_KEY) api.searchParams.set("key", process.env.PSI_API_KEY);
    for (const c of ["performance", "accessibility", "best-practices", "seo"]) {
      api.searchParams.append("category", c);
    }

    let json;
    try {
      const res = await fetch(api, { signal: AbortSignal.timeout(180000) });
      json = await res.json();
      if (json.error) {
        // Never echo the request URL - it carries the bypass secret.
        console.error(`  ${label} run ${i + 1}: ${String(json.error.message).slice(0, 160)}`);
        continue;
      }
    } catch (error) {
      console.error(`  ${label} run ${i + 1}: ${error.message}`);
      continue;
    }

    const lr = json.lighthouseResult;
    const cat = (n) => (lr.categories[n] ? Math.round(lr.categories[n].score * 100) : null);
    const audit = (id) => lr.audits[id]?.numericValue ?? null;

    runs.push({
      perf: cat("performance"),
      a11y: cat("accessibility"),
      bp: cat("best-practices"),
      seo: cat("seo"),
      fcp: audit("first-contentful-paint"),
      lcp: audit("largest-contentful-paint"),
      tbt: audit("total-blocking-time"),
      cls: audit("cumulative-layout-shift")
    });
    console.log(`  ${label} run ${i + 1}: perf ${runs.at(-1).perf}`);
  }

  if (!runs.length) {
    rows.push({ combo: label, perf: "FAILED" });
    continue;
  }

  rows.push({
    combo: label,
    perf: median(runs.map((r) => r.perf)),
    a11y: median(runs.map((r) => r.a11y)),
    bp: median(runs.map((r) => r.bp)),
    seo: median(runs.map((r) => r.seo)),
    "FCP ms": fmt(median(runs.map((r) => r.fcp))),
    "LCP ms": fmt(median(runs.map((r) => r.lcp))),
    "TBT ms": fmt(median(runs.map((r) => r.tbt))),
    CLS: (median(runs.map((r) => r.cls)) ?? 0).toFixed(3),
    runs: runs.map((r) => r.perf).join("/")
  });
}

console.log(`\n-- PageSpeed Insights - Google infrastructure - median of ${RUNS} --`);
console.table(rows);
