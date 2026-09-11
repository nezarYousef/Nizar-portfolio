"use client";

/*
 * Scroll-Craft style progress publisher.
 *
 * Every registered element gets a `--p` custom property between 0 and 1 that
 * describes where it is in its own scroll journey. CSS reads it with calc(),
 * and JS subscribers (the 3D scene) read it through `onChange`. One shared,
 * rAF-throttled scroll listener serves the whole page, so scrolling never
 * re-renders React.
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

function measure() {
  frame = 0;
  const viewportHeight = window.innerHeight || 1;

  entries.forEach((entry) => {
    const progress = clamp01(computeProgress(entry, viewportHeight));
    if (Math.abs(progress - entry.last) < 0.0005) return;

    entry.last = progress;
    if (entry.writeVar) {
      entry.element.style.setProperty(entry.varName, progress.toFixed(4));
    }
    entry.onChange?.(progress);
  });
}

function schedule() {
  if (!frame) frame = window.requestAnimationFrame(measure);
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

export function refreshScrollProgress() {
  if (typeof window !== "undefined") schedule();
}

/**
 * @param {React.RefObject<HTMLElement>} ref
 * @param {{ mode?: "pin" | "through" | "enter" | "exit" | "read", span?: number,
 *           onChange?: (p: number) => void, disabled?: boolean,
 *           varName?: string, writeVar?: boolean, resetTo?: number }} options
 */
export function useScrollProgress(ref, options = {}) {
  const {
    mode = "through",
    span = 1,
    onChange,
    disabled = false,
    varName = "--p",
    writeVar = true,
    resetTo = 1
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

    const entry = { element, mode, span, onChange, varName, writeVar, last: -1 };
    entries.add(entry);
    startListening();
    schedule();

    return () => {
      entries.delete(entry);
      stopListening();
    };
  }, [ref, mode, span, onChange, disabled, varName, writeVar, resetTo]);
}
