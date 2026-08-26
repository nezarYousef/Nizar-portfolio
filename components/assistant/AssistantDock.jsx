"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AssistantDock.module.css";

/* A small companion character docked in a quiet corner of the viewport once
   the hero has been left behind. It is navigation with a face: the panel it
   opens re-exposes the main nav and direct email - every label comes from the
   existing copy, no invented dialogue.

   Character behaviour, all optional by environment:
   - idle float / antenna pulse / occasional blink / hover wave:
     CSS states, killed globally under prefers-reduced-motion
   - eye tracking with head-and-body follow: one passive pointermove + one
     lerped rAF loop that parks itself whenever the dock is off screen or the
     tab is hidden; the loop writes custom properties on the root only, and
     each part reads them at a different gain - eyes lead, head follows, body
     trails - so attention feels layered rather than rigid
   - proximity: inside a short radius the character perks up (grows slightly,
     visor tints); expressed purely through a data attribute + CSS, no
     re-render
   - click: a squash-and-flash acknowledgement on every press, timed out on a
     ref so rapid clicking cannot stack timers */

function AssistantCharacter({ eyeRef }) {
  return (
    <svg className={styles.character} viewBox="0 0 64 70" aria-hidden="true" focusable="false">
      {/* antenna */}
      <line className={styles.antenna} x1="32" y1="15" x2="32" y2="8" />
      <circle className={styles.antennaTip} cx="32" cy="6" r="2.8" />

      {/* head */}
      <g className={styles.head}>
        <g className={styles.headLook}>
          <rect className={styles.headShell} x="14" y="16" width="36" height="27" rx="11" />
          <rect className={styles.visor} x="19" y="23.5" width="26" height="12.5" rx="6.2" />
          <g ref={eyeRef} className={styles.eyes}>
            <circle className={styles.eye} cx="27.2" cy="29.8" r="2.5" />
            <circle className={styles.eye} cx="36.8" cy="29.8" r="2.5" />
          </g>
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
    /* Every close path returns focus to the trigger, so keyboard users are
       never dropped onto <body> when the panel unmounts. */
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  /* Eyes lead the gaze; head and body follow at lower gains so the character
     seems to turn toward you rather than slide. Everything lands as custom
     properties on the root - one style write per frame - and CSS maps them
     per part. Proximity is a plain data attribute swap. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !buttonRef.current) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return undefined;

    let raf = 0;
    let running = false;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const paint = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      const s = root.style;
      s.setProperty("--lx", cx.toFixed(2));
      s.setProperty("--ly", cy.toFixed(2));
      s.setProperty("--hr", (cx * 1.15).toFixed(2));
      s.setProperty("--hy", (cy * 0.55).toFixed(2));
      s.setProperty("--bx", (cx * 0.4).toFixed(2));
      s.setProperty("--by", (cy * 0.32).toFixed(2));
      if (running) raf = requestAnimationFrame(paint);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(paint);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      /* Park every channel back centre when the loop stops. */
      tx = 0;
      ty = 0;
      const s = root.style;
      s.setProperty("--lx", "0");
      s.setProperty("--ly", "0");
      s.setProperty("--hr", "0");
      s.setProperty("--hy", "0");
      s.setProperty("--bx", "0");
      s.setProperty("--by", "0");
      delete root.dataset.near;
    };

    const onMove = (event) => {
      const rect = buttonRef.current.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height * 0.42);
      const len = Math.hypot(dx, dy) || 1;
      const reach = Math.min(len, 260) / 260;
      tx = (dx / len) * 2.6 * reach;
      ty = (dy / len) * 2.1 * reach;

      const near = len < 200;
      if ((root.dataset.near === "true") !== near) {
        if (near) root.dataset.near = "true";
        else delete root.dataset.near;
      }
    };

    const sync = () => {
      if (document.hidden || root.dataset.visible !== "true") {
        stop();
      } else {
        start();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", sync);
    const attrObserver = new MutationObserver(sync);
    attrObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-visible"]
    });
    sync();

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", sync);
      attrObserver.disconnect();
    };
  }, []);

  /* Squash-and-flash on any press. The timeout lives on a ref so spamming
     the button restarts one timer instead of stacking several. */
  const bounceTimer = useRef(0);
  useEffect(() => () => clearTimeout(bounceTimer.current), []);

  const excite = () => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.bounce = "true";
    clearTimeout(bounceTimer.current);
    bounceTimer.current = setTimeout(() => {
      delete root.dataset.bounce;
    }, 680);
  };

  return (
    <div
      ref={rootRef}
      className={styles.dock}
      id="assistant-dock"
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
                  onClick={() => {
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            className={`${styles.mail} u-mono`}
            href={email.href}
            onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}
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
        onClick={() => {
          excite();
          setOpen((value) => !value);
        }}
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
