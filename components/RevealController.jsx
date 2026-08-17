"use client";

import { useEffect } from "react";

/* One observer for every [data-reveal] on the page.

   Nothing is hidden until this runs and confirms an IntersectionObserver
   exists (it sets data-reveal-armed on <html>), so a blocked or failed bundle
   leaves all content visible rather than blank. */
export default function RevealController() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const root = document.documentElement;
    root.dataset.revealArmed = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.revealed = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    const targets = document.querySelectorAll("[data-reveal]");
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      delete root.dataset.revealArmed;
    };
  }, []);

  return null;
}
