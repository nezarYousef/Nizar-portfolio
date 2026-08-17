/* Keyboard-only pass plus a few structural assertions. Everything here is
   checked by driving real keys, not by reading the source. */
import { chromium } from "playwright";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:4321";
const path = process.env.A11Y_PATH ?? "/";

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const problems = [];
const note = (label, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : "  XX  "}${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) problems.push(label);
};

await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

/* ── Structure ─────────────────────────────────────────────────────────── */
const structure = await page.evaluate(() => {
  const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => ({
    level: Number(h.tagName[1]),
    text: h.textContent.trim().slice(0, 40)
  }));

  let orderBreaks = [];
  for (let i = 1; i < headings.length; i += 1) {
    if (headings[i].level - headings[i - 1].level > 1) {
      orderBreaks.push(`${headings[i - 1].level}->${headings[i].level} at "${headings[i].text}"`);
    }
  }

  return {
    h1Count: document.querySelectorAll("h1").length,
    orderBreaks,
    /* Only a <header> that is not inside sectioning content maps to the
       `banner` landmark; the ones inside article/section are sectioning
       headers and are perfectly legal. Same rule for footer/contentinfo. */
    landmarks: {
      banner: [...document.querySelectorAll("header")].filter(
        (node) => !node.closest("article, section, aside, nav, main, [role='dialog']")
      ).length,
      nav: document.querySelectorAll("nav").length,
      main: document.querySelectorAll("main").length,
      contentinfo: [...document.querySelectorAll("footer")].filter(
        (node) => !node.closest("article, section, aside, nav, main")
      ).length,
      sectioningHeaders: document.querySelectorAll("header").length
    },
    imagesMissingAlt: [...document.querySelectorAll("img")].filter(
      (img) => img.getAttribute("alt") === null
    ).length,
    imagesWithoutDimensions: [...document.querySelectorAll("img")].filter(
      (img) => !img.getAttribute("width") && !img.getAttribute("height")
    ).length,
    skipLink: document.querySelector(".u-skip-link")?.getAttribute("href") ?? null
  };
});

note("exactly one <h1>", structure.h1Count === 1, `found ${structure.h1Count}`);
note(
  "no skipped heading levels",
  structure.orderBreaks.length === 0,
  structure.orderBreaks.join("; ")
);
note(
  "exactly one banner / main / contentinfo landmark",
  structure.landmarks.banner === 1 &&
    structure.landmarks.main === 1 &&
    structure.landmarks.contentinfo === 1,
  JSON.stringify(structure.landmarks)
);
note("every img has alt", structure.imagesMissingAlt === 0, `${structure.imagesMissingAlt} missing`);
note(
  "every img has dimensions",
  structure.imagesWithoutDimensions === 0,
  `${structure.imagesWithoutDimensions} missing`
);
note("skip link targets #main", structure.skipLink === "#main", String(structure.skipLink));

/* ── Skip link is first in the tab order ───────────────────────────────── */
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => ({
  cls: document.activeElement?.className ?? "",
  text: document.activeElement?.textContent?.trim().slice(0, 30) ?? ""
}));
note(
  "skip link focused first",
  firstFocus.cls.includes("skip-link"),
  `${firstFocus.text || firstFocus.cls}`
);

/* ── Filters are reachable and operable by keyboard ────────────────────── */
const filterResult = await page.evaluate(async () => {
  const group = document.querySelector('[role="group"]');
  const buttons = [...group.querySelectorAll("button")];
  const target = buttons[1];
  target.focus();
  const focusedBefore = document.activeElement === target;
  return { focusedBefore, label: target.textContent.trim(), count: buttons.length };
});
await page.keyboard.press("Space");
await page.waitForTimeout(200);
const filterPressed = await page.evaluate(() => {
  const group = document.querySelector('[role="group"]');
  const buttons = [...group.querySelectorAll("button")];
  return buttons[1].getAttribute("aria-pressed");
});
note(
  "filter button togglable with Space",
  filterResult.focusedBefore && filterPressed === "true",
  `${filterResult.label}, aria-pressed=${filterPressed}`
);

/* ── Modal: open by keyboard, trap, Escape, restore ────────────────────── */
await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
const trigger = page.locator("#projects button").filter({ hasText: /gallery|صور/i }).first();
await trigger.scrollIntoViewIfNeeded();
await trigger.focus();
const triggerText = (await trigger.textContent())?.trim().slice(0, 40);
await page.keyboard.press("Enter");
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
await page.waitForTimeout(400);

const inDialog = await page.evaluate(
  () => !!document.activeElement?.closest('[role="dialog"]')
);
note("focus moves into dialog on open", inDialog);

// Tab many times; focus must never escape the dialog.
let escaped = false;
for (let i = 0; i < 24; i += 1) {
  await page.keyboard.press("Tab");
  const still = await page.evaluate(
    () => !!document.activeElement?.closest('[role="dialog"]')
  );
  if (!still) {
    escaped = true;
    break;
  }
}
note("Tab is trapped inside dialog", !escaped);

await page.keyboard.press("Escape");
await page.waitForTimeout(400);
const closed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
note("Escape closes dialog", closed);

const restored = await page.evaluate(
  () => document.activeElement?.textContent?.trim().slice(0, 40) ?? ""
);
note("focus restored to trigger", restored === triggerText, `"${restored}"`);

const bodyLocked = await page.evaluate(() =>
  document.body.classList.contains("is-modal-open")
);
note("scroll lock released", !bodyLocked);

await browser.close();

console.log(problems.length ? `\n${problems.length} problem(s)` : "\nall checks passed");
process.exit(problems.length ? 1 : 0);
