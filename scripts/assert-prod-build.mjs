/* Refuse to measure anything unless the server is serving a real production
   build.

   Three measurement rounds in this project were invalidated because `next dev`
   was started by hand in an editor terminal while a production build was being
   measured. They share .next, so dev overwrites the production output and the
   server starts answering /_next/static requests with 400 or serving dev
   chunks. The page then renders without CSS or never hydrates, which does not
   look like a failure - it looks like a very fast page with a few odd audit
   results. Every number taken in that state is fiction.

   The tell is the stylesheet URLs. A production App Router build emits flat
   content-hashed files:

     /_next/static/css/ab3c5dc6ffc7a521.css

   A dev build emits source-path-shaped ones:

     /_next/static/css/app/(en)/layout.css
     /_next/static/css/_app-pages-browser_components_projects_ProjectModal_jsx.css

   So: check the shape of what is actually served, and refuse to proceed if it
   is wrong. Catching this before a measurement costs seconds; catching it
   afterwards costs the whole round.
*/
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PROD_CSS = /^\/_next\/static\/css\/[0-9a-f]{8,}\.css$/;

export async function assertProductionBuild(base = "http://localhost:4321", paths = ["/", "/ar"]) {
  const problems = [];

  // 1. A production build leaves a BUILD_ID behind. Dev never does.
  if (!existsSync(".next/BUILD_ID")) {
    problems.push(".next/BUILD_ID is missing - .next is not a production build");
  }

  // 2. No dev server may be alive, even if .next currently looks right - it
  //    would overwrite the tree partway through the measurement.
  try {
    const running = execFileSync(
      "powershell",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ` +
          `Where-Object { $_.CommandLine -match 'next(\\.js)?.{0,20}dev|run dev' } | ` +
          `ForEach-Object { "$($_.ProcessId) $($_.CommandLine)" }`
      ],
      { encoding: "utf8" }
    ).trim();
    if (running) {
      problems.push(`a dev server is running:\n      ${running.split(/\r?\n/).join("\n      ")}`);
    }
  } catch {
    /* process listing unavailable - fall through to the served-shape check */
  }

  // 3. The decisive check: what is actually being served right now.
  for (const path of paths) {
    let html;
    try {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) {
        problems.push(`${path} responded ${res.status}`);
        continue;
      }
      html = await res.text();
    } catch (error) {
      problems.push(`${path} is unreachable (${error.message}) - is the server running?`);
      continue;
    }

    const hrefs = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]);
    if (!hrefs.length) {
      problems.push(`${path} links no stylesheet at all`);
      continue;
    }
    const devShaped = hrefs.filter((h) => !PROD_CSS.test(h));
    if (devShaped.length) {
      problems.push(
        `${path} is serving dev-shaped CSS:\n      ${devShaped.join("\n      ")}`
      );
    }

    // A page whose font variables never resolve renders in Times New Roman and
    // would silently invalidate every font and CLS measurement.
    for (const href of hrefs.filter((h) => PROD_CSS.test(h))) {
      const css = await (await fetch(`${base}${href}`)).text();
      if (css.includes("--font-sans")) return report(problems, base);
    }
  }

  if (!problems.some((p) => p.includes("unreachable"))) {
    const anyFontVar = problems.length === 0;
    if (anyFontVar) problems.push("no served stylesheet defines --font-sans");
  }

  return report(problems, base);
}

function report(problems, base) {
  if (!problems.length) {
    const id = existsSync(".next/BUILD_ID")
      ? readFileSync(".next/BUILD_ID", "utf8").trim()
      : "?";
    console.log(`build check OK - production build ${id} serving at ${base}\n`);
    return true;
  }
  console.error("\nREFUSING TO MEASURE - the server is not serving a clean production build:");
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error(
    "\nFix: stop every dev server, then `node scripts/safe-build.mjs --force`,\n" +
      "then restart `next start` before measuring again.\n"
  );
  process.exit(1);
}
