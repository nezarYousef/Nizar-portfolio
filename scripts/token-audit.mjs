/* Design-token conformance checker.

   The tokens in app/globals.css are the contract; this asserts the components
   actually honour it. Written for the Phase 2 consistency audit, kept so every
   later commit can be checked the same way instead of by eye.

   A finding is a declaration that hard-codes a value the token system already
   names, or invents a value the system has no name for. Both are drift: the
   first guarantees the two copies diverge, the second means there is no single
   answer to "how big is a control".

   Deliberate exceptions are declared in the CSS itself, on the line before:

     /* token-audit-ignore: reason the raw value is correct here *\/

   An ignore without a reason is itself reported, so exceptions stay arguable
   rather than accumulating silently.

   Usage: node scripts/token-audit.mjs [--json]
*/
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const FILES = [
  "app/globals.css",
  ...globSync("components/**/*.module.css").map((p) => p.replace(/\\/g, "/"))
].sort();

/* The five widths the site is allowed to change layout at. Every other value
   is a component inventing its own breakpoint. max-width queries pair with
   min-width ones, so N-1 is allowed wherever N is. */
const BREAKPOINTS = [480, 768, 1024, 1280, 1560];
const ALLOWED_WIDTHS = new Set([
  ...BREAKPOINTS,
  ...BREAKPOINTS.map((w) => w - 1)
]);

const SPACING_PROPS =
  /^(padding|margin|gap|row-gap|column-gap|inset)(-(block|inline))?(-(start|end))?$/;

/* Lengths that are structural rather than spatial - a hairline, a full-bleed
   percentage, a zero - are not spacing decisions and carry no token. */
const NEUTRAL = /^(0|auto|none|inherit|initial|unset|revert|100%|1px)$/;

const rules = [
  {
    id: "raw-space",
    label: "spacing not from the 8pt scale",
    test: (prop, value) =>
      SPACING_PROPS.test(prop) &&
      /[0-9]/.test(value) &&
      /* A calc() built out of tokens is token-derived, however many bare
         numbers the arithmetic needs. */
      !/var\(--/.test(value) &&
      !value.split(/\s+/).every((part) => NEUTRAL.test(part)) &&
      !/\b1lh\b/.test(value)
  },
  {
    id: "raw-size",
    label: "font-size not from the type scale",
    test: (prop, value) => prop === "font-size" && !/var\(--text-/.test(value)
  },
  {
    id: "raw-weight",
    label: "font-weight not from the weight scale",
    test: (prop, value) => prop === "font-weight" && !/var\(--weight-/.test(value)
  },
  {
    id: "raw-leading",
    label: "line-height not from the leading scale",
    test: (prop, value) =>
      prop === "line-height" && !/var\(--leading-/.test(value)
  },
  {
    id: "raw-tracking",
    label: "letter-spacing not from the tracking scale",
    test: (prop, value) =>
      prop === "letter-spacing" && !/var\(--tracking-/.test(value)
  },
  {
    id: "raw-radius",
    label: "border-radius not from the geometry scale",
    test: (prop, value) =>
      /^border(-(start|end)-(start|end))?-radius$/.test(prop) &&
      !/var\(--radius-?/.test(value) &&
      value.trim() !== "50%"
  },
  {
    id: "raw-shadow",
    label: "box-shadow not from the elevation scale",
    test: (prop, value) =>
      prop === "box-shadow" && !/var\(--elev-/.test(value) && value !== "none"
  },
  {
    id: "raw-duration",
    label: "duration not from the motion scale",
    test: (prop, value) =>
      /^(transition|animation)(-duration|-delay)?$/.test(prop) &&
      /(^|[\s,(])[0-9.]+m?s\b/.test(value)
  },
  {
    id: "raw-easing",
    label: "easing not from the motion scale",
    test: (prop, value) =>
      /^(transition|animation)(-timing-function)?$/.test(prop) &&
      /cubic-bezier\(/.test(value)
  },
  {
    id: "raw-length",
    label: "px length with no token behind it",
    test: (prop, value) =>
      !SPACING_PROPS.test(prop) &&
      !/^(border|outline)/.test(prop) &&
      /(^|[\s,(])[0-9.]+px\b/.test(value) &&
      !/(^|[\s,(])1px\b/.test(value)
  },
  {
    id: "raw-colour",
    label: "colour literal outside the token blocks",
    test: (prop, value, { inTokenBlock }) =>
      !inTokenBlock && /#[0-9a-fA-F]{3,8}\b/.test(value)
  }
];

const findings = [];
let declarations = 0;

for (const file of FILES) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  /* :root blocks are where raw values are supposed to live - that is what a
     token is. Everything outside them is a consumer. */
  let depth = 0;
  let tokenDepth = -1;
  let pendingIgnore = null;

  let openIgnore = null;

  lines.forEach((rawLine, i) => {
    let line = rawLine;
    const lineNo = i + 1;
    /* An ignore comment usually wraps onto a second line, so collect it until
       the comment actually closes rather than requiring it to fit on one. */
    if (openIgnore !== null) {
      openIgnore += ` ${line}`;
      if (!line.includes("*/")) return;
      line = openIgnore;
      openIgnore = null;
    } else if (line.includes("token-audit-ignore") && !line.includes("*/")) {
      openIgnore = line;
      return;
    }

    const ignore = line.match(/token-audit-ignore:?(.*?)\*\//);
    if (ignore) {
      const reason = ignore[1].trim();
      if (!reason) {
        findings.push({
          file,
          line: lineNo,
          rule: "bare-ignore",
          label: "token-audit-ignore with no stated reason",
          text: line.trim()
        });
      }
      pendingIgnore = reason || "(none)";
      return;
    }

    if (/^\s*:root/.test(line) && tokenDepth === -1) tokenDepth = depth;
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;

    const inTokenBlock = tokenDepth !== -1;

    const decl = line.match(/^\s*([-a-z]+)\s*:\s*([^;]+);/);
    if (decl && !decl[1].startsWith("--")) {
      declarations += 1;
      const [, prop, value] = decl;
      for (const rule of rules) {
        if (rule.test(prop, value.trim(), { inTokenBlock })) {
          if (pendingIgnore) break;
          findings.push({
            file,
            line: lineNo,
            rule: rule.id,
            label: rule.label,
            text: `${prop}: ${value.trim()}`
          });
          break;
        }
      }
    }

    const media = line.match(/@media[^{]+/);
    if (media) {
      for (const m of media[0].matchAll(/(min|max)-width:\s*(\d+)px/g)) {
        const width = Number(m[2]);
        if (!ALLOWED_WIDTHS.has(width) && !pendingIgnore) {
          findings.push({
            file,
            line: lineNo,
            rule: "breakpoint",
            label: `breakpoint ${width}px is not one of ${BREAKPOINTS.join("/")}`,
            text: media[0].trim()
          });
        }
      }
    }

    depth += opens - closes;
    if (tokenDepth !== -1 && depth <= tokenDepth) tokenDepth = -1;
    if (decl || opens || closes) pendingIgnore = null;
  });
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const byRule = new Map();
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule).push(f);
  }

  for (const [rule, list] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${rule}  (${list.length})  ${list[0].label}`);
    for (const f of list) {
      console.log(`  ${f.file}:${f.line}  ${f.text}`);
    }
  }

  console.log(
    `\n${findings.length} finding(s) across ${FILES.length} files, ${declarations} declarations.`
  );
}

process.exitCode = findings.length ? 1 : 0;
