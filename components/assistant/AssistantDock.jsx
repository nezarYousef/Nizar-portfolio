"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AssistantDock.module.css";

/* A small companion character docked in a quiet corner of the viewport once
   the hero has been left behind. It is navigation with a face: the panel it
   opens re-exposes the main nav and direct email - every label comes from the
   existing copy, no invented dialogue.

   Character behaviour, all optional by environment:
   - idle float / antenna pulse / occasional blink / hover wave / open bounce:
     CSS states, killed globally under prefers-reduced-motion
   - eye tracking: one passive pointermove + one lerped rAF loop that parks
     itself whenever the dock is off screen or the tab is hidden           */

function AssistantCharacter({ eyeRef }) {
  return (
    <svg className={styles.character} viewBox="0 0 64 70" aria-hidden="true" focusable="false">
      {/* antenna */}
      <line className={styles.antenna} x1="32" y1="15" x2="32" y2="8" />
      <circle className={styles.antennaTip} cx="32" cy="6" r="2.8" />

      {/* head */}
      <g className={styles.head}>
        <rect className={styles.headShell} x="14" y="16" width="36" height="27" rx="11" />
        <rect className={styles.visor} x="19" y="23.5" width="26" height="12.5" rx="6.2" />
        <g ref={eyeRef} className={styles.eyes}>
          <circle className={styles.eye} cx="27.2" cy="29.8" r="2.5" />
          <circle className={styles.eye} cx="36.8" cy="29.8" r="2.5" />
        </g>
      </g>

      {/* body + arms */}
      <g className={styles.bodyGroup}>
        <rect className={styles.body} x="18.5" y="45" width="27" height="17.5" rx="8.5" />
        <circle className={styles.chestLight} cx="32" cy="53.5" r="2.1" />
        <rect className={styles.arm} x="9.5" y="46" width="7" height="13.5" rx="3.5" />
        <g className={styles.waveArm}>
          <rect className={styles.arm} x="47.5" y="46" width="7" height="13.5" rx="3.5" />
        </g>
      </g>
    </svg>
  );
}

export default function AssistantDock({ nav, status, email, controls }) {
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const eyeRef = useRef(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setPastHero(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0.55 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  /* Eyes follow the pointer with a short look radius and a soft lerp. */
  useEffect(() => {
    const eyes = eyeRef.current;
    if (!eyes || !buttonRef.current) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    let raf = 0;
    let running = false;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const apply = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      eyes.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
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
      /* Park the gaze back centre when the loop stops. */
      tx = 0;
      ty = 0;
    };

    const onMove = (event) => {
      const rect = buttonRef.current.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height * 0.42);
      const len = Math.hypot(dx, dy) || 1;
      const reach = Math.min(len, 260) / 260;
      tx = (dx / len) * 2.6 * reach;
      ty = (dy / len) * 2.1 * reach;
    };

    const sync = () => {
      if (document.hidden || rootRef.current?.dataset.visible !== "true") {
        stop();
      } else {
        start();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", sync);
    const attrObserver = new MutationObserver(sync);
    if (rootRef.current) {
      attrObserver.observe(rootRef.current, {
        attributes: true,
        attributeFilter: ["data-visible"]
      });
    }
    sync();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", sync);
      attrObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.dock}
      data-visible={pastHero ? "true" : "false"}
      data-open={open ? "true" : "false"}
    >
      {open ? (
        <div className={styles.panel} id="assistant-panel">
          <p className={`${styles.status} u-mono`}>
            <span className={styles.statusDot} aria-hidden="true" />
            {status}
          </p>

          <ul className={styles.links}>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  className={styles.link}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            className={`${styles.mail} u-mono`}
            href={email.href}
            onClick={() => setOpen(false)}
          >
            {email.label}
          </a>
        </div>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={open ? "assistant-panel" : undefined}
        aria-label={open ? controls.close : controls.open}
        title={open ? controls.close : controls.open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.charWrap}>
          {/* Ground shadow breathes in counter-phase with the float - it is
              what sells the character as hovering above the page. */}
          <span className={styles.groundShadow} aria-hidden="true" />
          <AssistantCharacter eyeRef={eyeRef} />
        </span>
      </button>
    </div>
  );
}
