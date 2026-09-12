"use client";

/*
 * Scroll-Craft style progress publisher.
 *
 * Every registered element gets a `--p` custom property between 0 and 1 that
 * describes where it is in its own scroll journey. CSS reads it with calc(),
 * and JS subscribers (the 3D scene) read it through `onChange`. One shared,
 * rAF-driven loop serves the whole page, so scrolling never re-renders React.
 *
 * The published value is *eased toward* the raw scroll position rather than
 * copied from it: wheel and trackpad events arrive in uneven bursts, and a 1:1
 * write reproduces every gap in them. The easing is what makes the scroll acts
 * feel like one continuous motion instead of a stutter. Pass `smooth: false`
 * for consumers that do their own smoothing (the 3D rig).
 *
 * Modes
 *  - "pin":     0 when the element's top reaches the viewport top, 1 when its
 *               bottom reaches the viewport bottom (sticky stage travel).
 *  - "through": 0 when the top enters at the bottom of the viewport, 1 when
 *               the bottom leaves at the top.
 *  - "enter":   0 when the top enters at the bottom, 1 after `span`
 *               viewport-heights of further travel.
 *  - "exit":    0 while the top is at (or below) the viewport top, 1 once the
 *               element has scrolled fully past it (for unpinned heroes).
 *  - "read":    0 when the top is at 75% of the viewport, 1 when the bottom
 *               is at 55% (for timelines that draw as you read).
 */

import { useEffect } from "react";

const entries = new Set();
let frame = 0;
let listening = false;
let needsMeasure = true;
let lastTime = 0;

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

function computeProgress(entry, viewportHeight) {
  const rect = entry.element.getBoundingClientRect();

  switch (entry.mode) {
    case "pin":
      return -rect.top / Math.max(1, rect.height - viewportHeight);
    case "enter":
      return (viewportHeight - rect.top) / (viewportHeight * entry.span);
    case "exit":
      return -rect.top / Math.max(1, rect.height);
    case "read":
      return (
        (viewportHeight * 0.75 - rect.top) /
        Math.max(1, rect.height - viewportHeight * 0.2)
      );
    case "through":
    default:
      return (viewportHeight - rect.top) / (viewportHeight + rect.height);
  }
}

function publish(entry) {
  if (entry.writeVar) {
    entry.element.style.setProperty(entry.varName, entry.value.toFixed(4));
  }
  entry.onChange?.(entry.value);
}

function tick(time) {
  frame = 0;
  const delta = Math.min(0.05, lastTime ? (time - lastTime) / 1000 : 0.016);
  lastTime = time;
  const viewportHeight = window.innerHeight || 1;
  const measure = needsMeasure;
  needsMeasure = false;
  let settling = false;

  entries.forEach((entry) => {
    if (measure) entry.target = clamp01(computeProgress(entry, viewportHeight));

    if (entry.smooth) {
      const step = 1 - Math.exp(-delta * entry.ease);
      entry.value += (entry.target - entry.value) * step;
      if (Math.abs(entry.target - entry.value) > 0.0006) settling = true;
      else entry.value = entry.target;
    } else {
      entry.value = entry.target;
    }

    if (Math.abs(entry.value - entry.published) >= 0.0004 || entry.value !== entry.target) {
      entry.published = entry.value;
      publish(entry);
    }
  });

  if (settling) frame = window.requestAnimationFrame(tick);
  else lastTime = 0;
}

function schedule(remeasure = true) {
  if (remeasure) needsMeasure = true;
  if (!frame) frame = window.requestAnimationFrame(tick);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

function stopListening() {
  if (!listening || entries.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
}

/** Re-measure every act (after a layout change: language, theme, fonts). */
export function refreshScrollProgress() {
  if (typeof window !== "undefined" && entries.size) schedule();
}

/**
 * @param {React.RefObject<HTMLElement>} ref
 * @param {{ mode?: "pin" | "through" | "enter" | "exit" | "read", span?: number,
 *           onChange?: (p: number) => void, disabled?: boolean,
 *           varName?: string, writeVar?: boolean, resetTo?: number,
 *           smooth?: boolean, ease?: number }} options
 */
export function useScrollProgress(ref, options = {}) {
  const {
    mode = "through",
    span = 1,
    onChange,
    disabled = false,
    varName = "--p",
    writeVar = true,
    resetTo = 1,
    smooth = true,
    ease = 12
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (disabled) {
      // Static state: show the resolved composition, never a half-way frame.
      if (writeVar) element.style.setProperty(varName, String(resetTo));
      onChange?.(resetTo);
      return undefined;
    }

    const entry = {
      element,
      mode,
      span,
      onChange,
      varName,
      writeVar,
      smooth,
      ease,
      target: 0,
      value: 0,
      published: -1
    };

    // Start from the real position so nothing eases in from zero on load.
    entry.target = clamp01(computeProgress(entry, window.innerHeight || 1));
    entry.value = entry.target;
    publish(entry);

    entries.add(entry);
    startListening();
    schedule();

    return () => {
      entries.delete(entry);
      stopListening();
    };
  }, [ref, mode, span, onChange, disabled, varName, writeVar, resetTo, smooth, ease]);
}
