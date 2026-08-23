"use client";

import { useEffect, useRef } from "react";

/* Pointer-reactive depth for project previews. Transform-only, batched into
   one rAF, and refused outright on touch devices / coarse pointers / reduced
   motion - there it renders as a plain static frame. Styles come from the
   caller's module so this stays presentation-free. */
export default function TiltPanel({ className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    let raf = 0;
    const apply = (rx, ry, mx, my) => {
      el.style.transform = `perspective(950px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        apply((0.5 - ny) * 4.5, (nx - 0.5) * 6, nx * 100, ny * 100)
      );
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => apply(0, 0, 50, 50));
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
