/* Lighthouse is noisy on a machine that is also running a dev server and a
   browser, so every combination is run several times and the median is
   reported. Medians, not best-of - best-of would flatter the result. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, HOST_LABEL } from "./_target.mjs";


await assertProductionBuild(BASE);
const RUNS = Number(process.env.LH_RUNS ?? 3);
/* Performance is the only noisy category, so it is the only one worth paying
   for extra iterations. a11y/best-practices/seo are deterministic on a given
   build - three runs of those returned identical scores every time. */
const CATEGORIES = process.env.LH_CATEGORIES ?? "performance,accessibility,best-practices,seo";

const COMBOS = [
  { label: "en mobile", path: "/", desktop: false },
  { label: "en desktop", path: "/", desktop: true },
  { label: "ar mobile", path: "/ar", desktop: false },
  { label: "ar desktop", path: "/ar", desktop: true }
];

mkdirSync("reports", { recursive: true });

/* The bypass header goes to Lighthouse as a FILE, not as inline JSON on the
   command line. Two reasons, both learned the hard way: cmd.exe mangles the
   quotes and braces of inline JSON, so the flag arrived malformed and every
   run failed; and an argv-borne secret gets echoed verbatim into any
   execFileSync error dump. reports/ is gitignored. */
const HEADERS_FILE = "reports/lh-headers.json";
if (Object.keys(HEADERS).length) {
  writeFileSync(HEADERS_FILE, JSON.stringify(HEADERS));
}

const median = (values) => {
  // A category that was never requested should read as absent, not as zero.
  const present = values.filter((v) => v !== null && v !== undefined);
  if (!present.length) return "-";
  const sorted = present.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/* Lighthouse spawns its own Chrome and does not reliably reap it on Windows.
   Left alone, a nine-run sequence poisons itself: each leftover keeps
   competing for CPU, so later runs score progressively worse and the spread
   gets read as measurement noise. One sequence degraded 100 -> 76 with TBT
   going 2ms -> 357ms, and another died outright with NO_FCP because nothing
   could paint in time.

   Only --headless instances are killed. The user's own Chrome windows are
   never touched - an earlier cleanup here was not that careful, and closed
   them. */
const reapHeadlessChrome = () => {
  try {
    execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | ` +
          `Where-Object { $_.CommandLine -match '--headless' } | ` +
          `ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`
      ],
      { stdio: "ignore" }
    );
  } catch {
    /* nothing to reap, or no process listing - not fatal */
  }
};

const fmt = (v) => (typeof v === "number" ? Math.round(v) : "-");

const rows = [];

for (const combo of COMBOS) {
  const runs = [];

  for (let i = 0; i < RUNS; i += 1) {
    const out = `reports/tmp-run.json`;
    const args = [
      "lighthouse",
      `${BASE}${combo.path}`,
      `--only-categories=${CATEGORIES}`,
      "--output=json",
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox',
      "--quiet"
    ];
    /* Without this a protected preview redirects to the Vercel SSO page and
       Lighthouse cheerfully audits the login screen. */
    if (Object.keys(HEADERS).length) {
      args.push(`--extra-headers=${HEADERS_FILE}`);
    }
    if (combo.desktop) args.push("--preset=desktop");
    else args.push("--form-factor=mobile", "--screenEmulation.mobile");

    try {
      execFileSync("npx", args, { stdio: ["ignore", "ignore", "pipe"], shell: true });
    } catch (error) {
      // stdio:"ignore" threw away the reason on every previous failure. Keep
      // stderr so a broken run says what broke instead of just exiting 1.
      const stderr = error.stderr?.toString().trim().slice(-800);
      console.error(
        `${combo.label} run ${i + 1} failed:`,
        stderr || "(no stderr captured)"
      );
      reapHeadlessChrome();
      throw error;
    }
    reapHeadlessChrome();
    const report = JSON.parse(readFileSync(out, "utf8"));

    // LH_CATEGORIES may exclude a category; asking it for a score then crashes.
    const score = (name) =>
      report.categories[name] ? Math.round(report.categories[name].score * 100) : null;

    runs.push({
      perf: score("performance"),
      a11y: score("accessibility"),
      bp: score("best-practices"),
      seo: score("seo"),
      // A category-limited run does not produce the performance audits at all.
      ...(([a]) => ({
        fcp: a("first-contentful-paint"),
        lcp: a("largest-contentful-paint"),
        tbt: a("total-blocking-time"),
        cls: a("cumulative-layout-shift")
      }))([(id) => report.audits[id]?.numericValue ?? null])
    });
    rmSync(out, { force: true });
  }

  rows.push({
    host: HOST_LABEL,
    combo: combo.label,
    perf: median(runs.map((r) => r.perf)),
    a11y: median(runs.map((r) => r.a11y)),
    bp: median(runs.map((r) => r.bp)),
    seo: median(runs.map((r) => r.seo)),
    "FCP ms": fmt(median(runs.map((r) => r.fcp))),
    "LCP ms": fmt(median(runs.map((r) => r.lcp))),
    "TBT ms": fmt(median(runs.map((r) => r.tbt))),
    CLS: typeof median(runs.map((r) => r.cls)) === "number" ? median(runs.map((r) => r.cls)).toFixed(3) : "-",
    // A median alone hid a 94/58/61 spread. Show the range it came from.
    "perf min": Math.min(...runs.map((r) => r.perf)),
    "perf max": Math.max(...runs.map((r) => r.perf)),
    perfRuns: runs.map((r) => r.perf).join("/")
  });

  console.log(`${combo.label}: perf runs ${rows.at(-1).perfRuns}`);
}

console.log(`\nmedian of ${RUNS} runs each:`);
console.table(rows);
