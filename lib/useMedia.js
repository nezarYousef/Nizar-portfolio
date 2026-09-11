"use client";

import { useEffect, useState } from "react";

/** Subscribes to a media query. Returns `fallback` during SSR and first paint. */
export function useMediaQuery(query, fallback = false) {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)", false);

/** Desktop layouts that can afford pinned (sticky) scroll acts. */
export const useCanPin = () =>
  useMediaQuery(
    "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)",
    false
  );
