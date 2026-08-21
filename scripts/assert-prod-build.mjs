/* Refuse to measure anything unless the target is serving a real production
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

   Two classes of check, and which apply depends on the host:

     - LOCAL ONLY: .next/BUILD_ID on disk, and no dev server process alive.
       Both are facts about this machine. Asserting them against a Vercel
       preview would be checking the wrong computer - it would pass or fail on
       the state of a laptop that is not serving the page.
     - ANY HOST: the shape of what is actually served. This is the check that
       matters, and it is the one that travels.
*/
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { HEADERS } from "./_target.mjs";

const PROD_CSS = /^\/_next\/static\/css\/[0-9a-f]{8,}\.css$/;

const isLocal = (base) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(base);

export async function assertProductionBuild(base = "http://localhost:4321", paths = ["/", "/ar"]) {
  const problems = [];
  const local = isLocal(base);

  if (local) {
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
            `Where-Object { $_.CommandLine -match 'next(\.js)?.{0,20}dev|run dev' } | ` +
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
  }

  // 3. The decisive check, and the only one that is meaningful for a remote
  //    host: what is actually being served right now.
  let sawFontVariable = false;

  for (const path of paths) {
    let html;
    try {
      const res = await fetch(`${base}${path}`, { headers: HEADERS });
      if (!res.ok) {
        // A protected Vercel preview answers 401 with an SSO page rather than
        // the site, which would otherwise look like a mysterious empty result.
        const hint =
          res.status === 401 || res.status === 403
            ? " - deployment protection is on; disable it for this preview or use a bypass token"
            : "";
        problems.push(`${path} responded ${res.status}${hint}`);
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
      problems.push(`${path} is serving dev-shaped CSS:\n      ${devShaped.join("\n      ")}`);
    }

    // A page whose font variables never resolve renders in Times New Roman and
    // would silently invalidate every font and CLS measurement. Every path is
    // checked, not just the first - /ar loads a face that / does not.
    for (const href of hrefs.filter((h) => PROD_CSS.test(h))) {
      const css = await (await fetch(`${base}${href}`, { headers: HEADERS })).text();
      if (css.includes("--font-sans")) {
        sawFontVariable = true;
        break;
      }
    }
  }

  if (!sawFontVariable && !problems.length) {
    problems.push("no served stylesheet defines --font-sans");
  }

  return report(problems, base, local);
}

function report(problems, base, local) {
  if (!problems.length) {
    const id = local && existsSync(".next/BUILD_ID")
      ? `production build ${readFileSync(".next/BUILD_ID", "utf8").trim()}`
      : "production-shaped build";
    console.log(`build check OK - ${id} serving at ${base} [${local ? "local" : "remote"}]\n`);
    return true;
  }
  console.error(
    `\nREFUSING TO MEASURE - ${base} is not serving a clean production build:`
  );
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error(
    local
      ? "\nFix: stop every dev server, then `node scripts/safe-build.mjs --force`,\n" +
          "then restart `next start` before measuring again.\n"
      : "\nFix: confirm the deployment finished and is publicly reachable, then retry.\n"
  );
  process.exit(1);
}
