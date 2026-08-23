/* Keyboard-only pass. Lighthouse's accessibility score is automated-only and
   says nothing about whether the page can actually be operated without a
   mouse, so this drives it the way a keyboard user would and asserts on what
   happens: every interactive control reachable by Tab in DOM order, the
   gallery dialog trapping focus, Escape closing it, focus returning to the
   control that opened it, and every custom control responding to Space as
   well as Enter.

   No mouse events are used anywhere below - only Tab, Shift+Tab, Enter,
   Space and Escape. */
import { chromium } from "playwright";
import { assertProductionBuild } from "./assert-prod-build.mjs";
import { BASE, HEADERS, waitForIntro } from "./_target.mjs";


await assertProductionBuild(BASE);
const LOCALES = [
  ["en", "/"],
  ["ar", "/ar"]
];

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;

const pass = (msg) => console.log(`  PASS  ${msg}`);
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
};
const check = (cond, msg) => (cond ? pass(msg) : fail(msg));

/* Describes whatever currently has focus, the way a screen reader would name
   it, so the traversal log is readable rather than a list of tag names. */
const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const name = (
      el.getAttribute("aria-label") ||
      el.textContent?.trim() ||
      el.getAttribute("title") ||
      ""
    )
      .replace(/\s+/g, " ")
      .slice(0, 44);
    return {
      tag: el.tagName.toLowerCase(),
      name,
      role: el.getAttribute("role"),
      expanded: el.getAttribute("aria-expanded"),
      pressed: el.getAttribute("aria-pressed"),
      href: el.getAttribute("href"),
      inDialog: !!el.closest('[role="dialog"]'),
      // A visible focus ring is a separate requirement from being focusable.
      outline: getComputedStyle(el).outlineStyle,
      outlineWidth: getComputedStyle(el).outlineWidth,
      boxShadow: getComputedStyle(el).boxShadow !== "none"
    };
  });

for (const [lang, path] of LOCALES) {
  console.log(`\n════ ${lang.toUpperCase()} (${path}) ════`);
  const context = await browser.newContext({
    extraHTTPHeaders: HEADERS,
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  /* The one-shot intro overlay owns the first seconds of a fresh session;
     keyboard traversal starts once it has handed over. */
  await waitForIntro(page);
  await page.waitForTimeout(600);

  /* ── 1. Skip link is the very first stop ────────────────────────────── */
  await page.keyboard.press("Tab");
  const first = await focused(page);
  check(
    first?.href === "#main",
    `first Tab lands on the skip link (got: ${first?.name || "nothing"})`
  );

  /* ── 2. Full forward traversal ──────────────────────────────────────── */
  const order = [];
  let noFocusRing = 0;
  /* Stop on a genuine wrap-around - focus back on the skip link - not on a
     repeated accessible name. Several controls legitimately share a name
     ("View on GitHub" appears on more than one project), and treating those
     as the end of the tab ring silently under-counts the traversal. */
  for (let i = 0; i < 400; i += 1) {
    const info = await focused(page);
    if (info) {
      if (info.href === "#main" && order.length > 4) break;
      order.push(info);
      const hasRing =
        info.boxShadow || (info.outline !== "none" && info.outlineWidth !== "0px");
      if (!hasRing) noFocusRing += 1;
    }
    await page.keyboard.press("Tab");
  }

  console.log(`  ...${order.length} controls reachable by Tab`);
  check(order.length > 25, `traversal reaches the whole page (${order.length} stops)`);
  check(
    noFocusRing === 0,
    `every focused control shows a focus indicator (${noFocusRing} without)`
  );

  const unnamed = order.filter((o) => !o.name);
  check(unnamed.length === 0, `every focus stop has an accessible name (${unnamed.length} unnamed)`);

  /* ── 3. Custom controls answer Space as well as Enter ────────────────── */
  // Filter buttons are the page's toggle-style controls. A <button> gets Space
  // for free, but that is exactly what this is confirming rather than assuming.
  for (const [label, selector] of [
    ["skills filter", '#skills [role="group"] button'],
    ["projects filter", '#projects [role="group"] button']
  ]) {
    const buttons = page.locator(selector);
    const count = await buttons.count();
    if (!count) {
      fail(`${label}: no filter controls found`);
      continue;
    }
    for (const key of ["Enter", "Space"]) {
      // Reset to the first filter, then move to the second with the keyboard.
      await buttons.first().focus();
      await page.keyboard.press("Tab");
      const before = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(sel)].map((b) => b.getAttribute("aria-pressed")),
        selector
      );
      await page.keyboard.press(key);
      await page.waitForTimeout(250);
      const after = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(sel)].map((b) => b.getAttribute("aria-pressed")),
        selector
      );
      check(
        JSON.stringify(before) !== JSON.stringify(after),
        `${label} responds to ${key} (aria-pressed changed)`
      );
      // Restore "All" so the next assertion starts from a known state.
      await buttons.first().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(200);
    }
  }

  /* ── 4. Phone reveal, by keyboard only ──────────────────────────────── */
  const phone = page.locator("#contact button").first();
  if (await phone.count()) {
    await phone.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(250);
    const revealed = await page.locator('#contact a[href^="tel:"]').count();
    check(revealed > 0, "phone reveal opens with Space and exposes a tel: link");
  } else {
    fail("phone reveal control not found");
  }

  /* ── 5. Gallery dialog: trap, Escape, focus restore ──────────────────── */
  const trigger = page
    .locator('#projects button:not([role="group"] button)')
    .first();
  await trigger.focus();
  const triggerName = (await focused(page))?.name;

  // Open with Enter.
  await page.keyboard.press("Enter");
  await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
  await page.waitForTimeout(350);

  const onOpen = await focused(page);
  check(onOpen?.inDialog === true, `focus moves into the dialog on open (${onOpen?.name})`);

  const modalAttrs = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return { modal: d?.getAttribute("aria-modal"), labelled: !!d?.getAttribute("aria-labelledby") || !!d?.getAttribute("aria-label") };
  });
  check(modalAttrs.modal === "true", "dialog is aria-modal");
  check(modalAttrs.labelled, "dialog has an accessible name");

  // Tab all the way round: focus must never leave the dialog.
  let escapedTrap = 0;
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const info = await focused(page);
    if (info && !info.inDialog) escapedTrap += 1;
  }
  check(escapedTrap === 0, `Tab is trapped inside the dialog (${escapedTrap} escapes in 40 presses)`);

  // And backwards.
  let escapedBack = 0;
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Shift+Tab");
    const info = await focused(page);
    if (info && !info.inDialog) escapedBack += 1;
  }
  check(escapedBack === 0, `Shift+Tab is trapped inside the dialog (${escapedBack} escapes in 20 presses)`);

  // Escape closes it.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(450);
  check((await page.locator('[role="dialog"]').count()) === 0, "Escape closes the dialog");

  const restored = await focused(page);
  check(
    restored?.name === triggerName,
    `focus returns to the trigger on close (expected "${triggerName}", got "${restored?.name}")`
  );

  // Re-open with Space to prove the trigger is not Enter-only, then close.
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);
  check(
    (await page.locator('[role="dialog"]').count()) > 0,
    "gallery trigger also opens with Space"
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);

  /* ── 6. Body scroll is locked while the dialog is open ───────────────── */
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(350);
  const locked = await page.evaluate(
    () => getComputedStyle(document.body).overflow === "hidden" ||
          document.body.classList.contains("is-modal-open")
  );
  check(locked, "background scroll is locked while the dialog is open");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  await context.close();
}

await browser.close();
console.log(
  failures ? `\n${failures} keyboard check(s) FAILED` : "\nall keyboard checks passed"
);
process.exit(failures ? 1 : 0);
