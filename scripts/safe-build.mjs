/* A production build that refuses to run next to a dev server.

   On Windows, `next dev` and `next build` share .next. If a dev server is
   alive while a build runs, the build's output is overwritten with dev-mode
   chunks and .next/BUILD_ID never appears. The server then answers every
   /_next/static request with 400, the page never hydrates, and everything
   measured against it is fiction - fast scores from a page that never ran its
   JS, plus a scatter of audit failures that do not exist in the real build.

   That happened three times in this project before it was spotted, so the
   check is automated rather than remembered: refuse to build while another
   next process is alive, then verify BUILD_ID afterwards.

   Pass --force to kill the offending processes instead of aborting.
*/
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

const FORCE = process.argv.includes("--force");

const ps = (script) =>
  execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf8"
  }).trim();

/* Every node process whose command line mentions next, minus this one. */
function nextProcesses() {
  const raw = ps(
    `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ` +
      `Where-Object { $_.CommandLine -match 'next|npm-cli' } | ` +
      `ForEach-Object { "$($_.ProcessId)|$($_.CommandLine)" }`
  );
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [pid, ...rest] = line.split("|");
      return { pid: Number(pid), cmd: rest.join("|") };
    })
    .filter((p) => p.pid !== process.pid);
}

const offenders = nextProcesses();

if (offenders.length) {
  console.log(`${offenders.length} next-related process(es) are running:`);
  offenders.forEach((p) => console.log(`  PID ${p.pid}  ${p.cmd.slice(0, 110)}`));

  if (!FORCE) {
    console.error(
      "\nRefusing to build. A concurrent dev server corrupts .next and every\n" +
        "measurement taken afterwards. Stop them, or re-run with --force."
    );
    process.exit(1);
  }

  console.log("\n--force given: stopping them.");
  ps(`Stop-Process -Id ${offenders.map((p) => p.pid).join(",")} -Force -ErrorAction SilentlyContinue`);
  // Give Windows a moment to release the file handles on .next.
  ps("Start-Sleep -Seconds 3");

  const left = nextProcesses();
  if (left.length) {
    console.error(`Could not stop: ${left.map((p) => p.pid).join(", ")}`);
    process.exit(1);
  }
}

console.log("no competing next processes - building clean\n");
rmSync(".next", { recursive: true, force: true });

const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

/* The build can print "Compiled successfully" and still leave a broken tree
   if something raced it, so trust the artefacts, not the log. */
if (!existsSync(".next/BUILD_ID")) {
  console.error("\nBUILD FAILED VERIFICATION: .next/BUILD_ID is missing.");
  process.exit(1);
}

const stragglers = nextProcesses();
if (stragglers.length) {
  console.error(
    `\nBUILD SUSPECT: ${stragglers.length} next process(es) appeared during the build:`
  );
  stragglers.forEach((p) => console.error(`  PID ${p.pid}  ${p.cmd.slice(0, 110)}`));
  console.error("Treat this build as contaminated and run again.");
  process.exit(1);
}

console.log(`\nbuild verified - BUILD_ID ${readFileSync(".next/BUILD_ID", "utf8").trim()}`);
