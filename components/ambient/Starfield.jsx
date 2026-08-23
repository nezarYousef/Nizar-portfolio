"use client";

import { useEffect, useRef } from "react";
import styles from "./Starfield.module.css";

/* The living floor of the universe: a fixed canvas of slow-drifting dust that
   sits behind the entire page - one continuous environment for every section,
   not a per-section effect. Deliberately almost subliminal: tiny points, low
   alpha, very slow drift, a whisper of pointer parallax.

   Budget discipline:
   - one canvas, one rAF loop, zero React state
   - particle count scales with viewport width (36 on phones → ~110 desktop)
   - DPR capped at 1.5; no shadowBlur/filter work per frame
   - the loop parks itself when the tab is hidden; under reduced motion it
     draws one static frame and never starts
   - every listener / observer / frame is cleaned up on unmount            */

const TINT_NEUTRAL = 0;
const TINT_ACCENT = 1;
const TINT_SIGNAL = 2;

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    let stars = [];
    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    /* Pointer parallax: target eases toward the pointer, offset follows the
       target - so the field leans a few pixels, it never snaps. */
    const pointer = { x: 0, y: 0 };
    const lean = { x: 0, y: 0 };

    const palette = { neutral: "", accent: "", signal: "" };
    const readPalette = () => {
      const root = window.getComputedStyle(document.documentElement);
      palette.neutral = root.getPropertyValue("--ink-muted").trim();
      palette.accent = root.getPropertyValue("--accent-bright").trim();
      palette.signal = root.getPropertyValue("--signal").trim();
    };

    const makeStars = () => {
      const count = Math.round(
        Math.min(110, Math.max(36, (width * height) / 26000))
      );
      /* Deterministic PRNG so a resize reshuffles gently but hydration and
         first paint always agree - same seed discipline as the intro. */
      let seed = 20260823;
      const rand = () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      stars = Array.from({ length: count }, () => {
        const depth = 0.3 + rand() * 0.7; // far dust … near motes
        const tintRoll = rand();
        return {
          x: rand() * width,
          y: rand() * height,
          depth,
          radius: (0.5 + rand() * 1.1) * (0.6 + depth * 0.8),
          alpha: 0.14 + rand() * 0.3,
          twinklePhase: rand() * Math.PI * 2,
          twinkleSpeed: 0.25 + rand() * 0.55,
          driftX: (0.04 + rand() * 0.07) * depth,
          driftY: (-0.008 - rand() * 0.02) * depth,
          tint:
            tintRoll > 0.94
              ? TINT_ACCENT
              : tintRoll > 0.88
                ? TINT_SIGNAL
                : TINT_NEUTRAL
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    };

    const drawFrame = (time, withDrift) => {
      ctx.clearRect(0, 0, width, height);
      const scrollLean =
        ((window.scrollY || 0) * 0.018) % height;

      for (const star of stars) {
        if (withDrift) {
          star.x += star.driftX;
          star.y += star.driftY;
          if (star.x > width + 2) star.x = -2;
          if (star.x < -2) star.x = width + 2;
          if (star.y > height + 2) star.y = -2;
          if (star.y < -2) star.y = height + 2;
        }

        /* Depth-scaled parallax: near motes move most, far dust least.
           Scroll adds a slow vertical tide so scrolling feels like drifting
           through the field rather than sliding a page over wallpaper. */
        const px =
          star.x + lean.x * 10 * star.depth;
        const py =
          (((star.y + lean.y * 8 * star.depth - scrollLean * star.depth) %
            height) +
            height) %
          height;

        const twinkle =
          star.alpha *
          (0.7 + 0.3 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase));

        ctx.globalAlpha = twinkle;
        ctx.fillStyle =
          star.tint === TINT_ACCENT
            ? palette.accent
            : star.tint === TINT_SIGNAL
              ? palette.signal
              : palette.neutral;
        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (time) => {
      if (!running) return;
      lean.x += (pointer.x - lean.x) * 0.04;
      lean.y += (pointer.y - lean.y) * 0.04;
      drawFrame(time, true);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced.matches) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / width) * 2 - 1;
      pointer.y = (event.clientY / height) * 2 - 1;
    };

    let resizeQueued = false;
    const onResize = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        resize();
        if (!running) drawFrame(0, false);
      });
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    readPalette();
    resize();

    /* Reduced motion: paint the field once, statically - atmosphere without
       movement - and never attach the loop or the pointer listener. */
    if (reduced.matches) {
      drawFrame(0, false);
    } else {
      drawFrame(0, true);
      start();
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      if (finePointer.matches) {
        window.addEventListener("pointermove", onPointerMove, {
          passive: true
        });
      }
    }

    /* Theme flips change the CSS variable palette; keep the dust in sync. */
    const themeObserver = new MutationObserver(() => {
      readPalette();
      if (!running) drawFrame(0, false);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.starfield}
      aria-hidden="true"
      role="presentation"
      focusable="false"
    />
  );
}
