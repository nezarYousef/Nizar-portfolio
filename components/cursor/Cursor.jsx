"use client";

import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

/* A two-part cursor identity: a precise accent dot that tracks the pointer
   with zero lag, and a soft ring that trails it with inertia - so the pointer
   stays exact while motion gains character.

   States are read from one delegated pointerover listener:
     a / button / [role=button]        -> ring grows around the control
     [data-cursor="view"]              -> ring becomes a labelled disc; the
                                          label comes from data-cursor-text,
                                          which sections stamp from real data
   Pressing scales everything down slightly for tactile feedback.

   Rules this lives by: fine pointers only, never under reduced motion, never
   over native behaviour that matters (the dot is pixel-exact), gone entirely
   when the pointer leaves the window. The native cursor is hidden by CSS only
   while html[data-cursor="on"] proves this component is actually running -
   if the bundle dies, nothing was ever hidden. */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    if (!fine.matches || reduced.matches) return undefined;

    root.dataset.cursor = "on";

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let running = false;

    /* Scale lives inside the same transform as the translation, never in the
       individual `scale` property: that one composes around the untranslated
       box, so `scale: 0.5` + `translate3d(x, y)` renders the part at (x/2,
       y/2) - the cursor drifts off the pointer exactly when it changes state.
       Composed here, it shrinks around the translated centre and the part
       stays pinned to the pointer. Targets are eased in the loop to keep the
       tactility the removed CSS transitions provided. */
    let ringScale = 1;
    let dotScale = 1;
    let ringScaleRendered = 1;
    let dotScaleRendered = 1;

    const apply = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ringScaleRendered += (ringScale - ringScaleRendered) * 0.3;
      dotScaleRendered += (dotScale - dotScaleRendered) * 0.3;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${dotScaleRendered.toFixed(3)})`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) scale(${ringScaleRendered.toFixed(3)})`;
      }
      if (running) raf = requestAnimationFrame(apply);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(apply);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!running) {
        /* Snap to the pointer on first entry instead of gliding across. */
        rx = x;
        ry = y;
        start();
      }
    };

    const setState = (state) => {
      if (ringRef.current) {
        ringRef.current.dataset.state = state;
      }
      if (dotRef.current) {
        dotRef.current.dataset.state = state;
      }
      dotScale = state === "link" ? 0.5 : 1;
    };

    const onOver = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const view = target.closest('[data-cursor="view"]');
      if (view) {
        if (labelRef.current) {
          labelRef.current.textContent = view.getAttribute("data-cursor-text") ?? "";
        }
        setState("view");
        return;
      }
      if (
        view === null &&
        target.closest("a, button, [role='button'], summary, input, textarea")
      ) {
        setState("link");
        return;
      }
      setState("");
    };

    const onLeaveWindow = () => {
      setState("hidden");
      stop();
    };

    const onDown = () => {
      ringRef.current?.setAttribute("data-pressed", "true");
      ringScale = 0.82;
    };
    const onUp = () => {
      ringRef.current?.removeAttribute("data-pressed");
      ringScale = 1;
    };

    const sync = () => {
      if (document.hidden) {
        stop();
      } else if (x >= 0) {
        start();
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow, { passive: true });
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      delete root.dataset.cursor;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <>
      <span ref={ringRef} className={styles.ring} aria-hidden="true">
        <span ref={labelRef} className={styles.label} />
      </span>
      <span ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
