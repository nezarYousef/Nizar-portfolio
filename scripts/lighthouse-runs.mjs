/* Lighthouse is noisy on a machine that is also running a dev server and a
   browser, so every combination is run several times and the median is
   reported. Medians, not best-of - best-of would flatter the result. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:4321";
const RUNS = Number(process.env.LH_RUNS ?? 3);

const COMBOS = [
  { label: "en mobile", path: "/", desktop: false },
  { label: "en desktop", path: "/", desktop: true },
  { label: "ar mobile", path: "/ar", desktop: false },
  { label: "ar desktop", path: "/ar", desktop: true }
];

mkdirSync("reports", { recursive: true });

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const rows = [];

for (const combo of COMBOS) {
  const runs = [];

  for (let i = 0; i < RUNS; i += 1) {
    const out = `reports/tmp-run.json`;
    const args = [
      "lighthouse",
      `${BASE}${combo.path}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox',
      "--quiet"
    ];
    if (combo.desktop) args.push("--preset=desktop");
    else args.push("--form-factor=mobile", "--screenEmulation.mobile");

    execFileSync("npx", args, { stdio: "ignore", shell: true });
    const report = JSON.parse(readFileSync(out, "utf8"));

    runs.push({
      perf: Math.round(report.categories.performance.score * 100),
      a11y: Math.round(report.categories.accessibility.score * 100),
      bp: Math.round(report.categories["best-practices"].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
      fcp: report.audits["first-contentful-paint"].numericValue,
      lcp: report.audits["largest-contentful-paint"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue
    });
    rmSync(out, { force: true });
  }

  rows.push({
    combo: combo.label,
    perf: median(runs.map((r) => r.perf)),
    a11y: median(runs.map((r) => r.a11y)),
    bp: median(runs.map((r) => r.bp)),
    seo: median(runs.map((r) => r.seo)),
    "FCP ms": Math.round(median(runs.map((r) => r.fcp))),
    "LCP ms": Math.round(median(runs.map((r) => r.lcp))),
    "TBT ms": Math.round(median(runs.map((r) => r.tbt))),
    CLS: median(runs.map((r) => r.cls)).toFixed(3),
    perfRuns: runs.map((r) => r.perf).join("/")
  });

  console.log(`${combo.label}: perf runs ${rows.at(-1).perfRuns}`);
}

console.log(`\nmedian of ${RUNS} runs each:`);
console.table(rows);
