/* One place that answers two questions every measurement script needs:
   what am I pointed at, and how do I get in.

   The Vercel preview is the source of truth for measurement - this laptop has
   produced four corrupted build rounds and carries a Windows-specific next/font
   bug, so its numbers describe the machine as much as the site. But a preview
   sits behind Vercel Authentication, which answers every unauthenticated
   request with a 302 to an SSO page. Lighthouse and Playwright both follow it
   and then measure the login screen, which scores very well and means nothing.

   Protection Bypass for Automation is the supported way in: a project-scoped
   secret sent as a header. The secret lives in .env.local (gitignored) and is
   never printed.
*/
import { existsSync, readFileSync } from "node:fs";

function readEnvLocal() {
  if (!existsSync(".env.local")) return {};
  return Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].trim()])
  );
}

export const BASE = process.env.SHOOT_BASE ?? "http://localhost:4321";
export const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(BASE);
export const HOST_LABEL = IS_LOCAL ? "local" : "preview";

const secret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET ??
  readEnvLocal().VERCEL_AUTOMATION_BYPASS_SECRET;

/* Deliberately just the one header, with no x-vercel-set-bypass-cookie.
   That companion header asks Vercel to convert the bypass into a cookie via a
   redirect, which is right for a browser being driven by hand but wrong here:
   node's fetch has no cookie jar, so it follows the redirect, arrives without
   the cookie, and is redirected again until it gives up with "redirect count
   exceeded". Both Playwright's extraHTTPHeaders and Lighthouse's
   --extra-headers apply this header to every request anyway, sub-resources
   included, so the cookie buys nothing and costs the guard. */
export const HEADERS =
  !IS_LOCAL && secret ? { "x-vercel-protection-bypass": secret } : {};

if (!IS_LOCAL && !secret) {
  console.error(
    "\nNo VERCEL_AUTOMATION_BYPASS_SECRET found, and the target is remote.\n" +
      "A protected preview will redirect to an SSO page and every number will\n" +
      "describe that page instead of the site. Set it in .env.local first.\n"
  );
  process.exit(1);
}
