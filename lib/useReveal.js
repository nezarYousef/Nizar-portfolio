"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every `[data-reveal]` (block fade-rise, styled in
 * globals.css) and `[data-reveal-lines]` (word-rise, styled per component)
 * inside `rootRef`, the first time it enters the viewport.
 */
export function useReveal(rootRef, deps = []) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const targets = root.querySelectorAll(
      "[data-reveal]:not(.is-in), [data-reveal-lines]:not(.is-in)"
    );
    if (!("IntersectionObserver" in window)) {
      targets.forEach((node) => node.classList.add("is-in"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
