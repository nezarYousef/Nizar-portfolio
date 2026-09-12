"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Preloader.module.css";

/*
 * Boot sequence. The portfolio's own voice ("$ ./boot-nizar-portfolio") reads
 * out the modules, greets the visitor, then the screen splits into panels that
 * lift away and hand over to the hero.
 *
 * Timing is gated on two things at once: a minimum hold so it never flashes
 * past, and actual readiness (fonts decoded, load event fired) so the hero is
 * not still assembling when it is uncovered. A hard cap keeps a slow network
 * from turning that into a wait.
 *
 * It runs once per browser tab, never for a deep link into a section, never
 * under `prefers-reduced-motion`, and it can always be skipped.
 */

/*
 * Timings are measured from navigation start, not from React mount, so the
 * intro occupies a predictable slice of the visitor's first two and a half
 * seconds however long the bundle took: roughly 1.4s reading out the modules,
 * a second on the greeting, then the panels lift. MOUNT_MIN is the floor that
 * stops it flashing past if we mounted late.
 */
const NAV_MIN = 1400; // greeting starts no earlier than this after navigation
const MOUNT_MIN = 900; // and no sooner than this after the intro is on screen
const GREET_MS = 950; // greeting held
const EXIT_MS = 780; // panels lift
const MAX_HOLD = 3100; // never wait longer than this for readiness

function whenReady() {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  return Promise.all([fonts, loaded]);
}

export default function Preloader({ copy, onDone, onReveal }) {
  const [phase, setPhase] = useState("boot"); // boot | greet | exit
  const meterRef = useRef(null);
  const linesRef = useRef(null);
  const percentRef = useRef(null);
  const skipRef = useRef(null);
  const doneRef = useRef(false);
  const readyRef = useRef(false);
  const timers = useRef([]);

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const mounted = performance.now();

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      timers.current.forEach(clearTimeout);
      setPhase("exit");
      // The panels lift on the compositor, so this is the moment to hand the
      // main thread to the hero's WebGL scene.
      onReveal?.();
      timers.current = [setTimeout(onDone, EXIT_MS)];
    };

    const toGreet = () => {
      if (doneRef.current) return;
      setPhase("greet");
      timers.current.push(setTimeout(finish, GREET_MS));
    };

    // Hold for whichever finishes last: the minimum beat, or the page.
    let capped = false;
    const cap = setTimeout(() => {
      capped = true;
      readyRef.current = true;
      toGreet();
    }, MAX_HOLD);
    timers.current.push(cap);

    whenReady().then(() => {
      readyRef.current = true;
      if (capped || doneRef.current) return;
      const now = performance.now();
      const wait = Math.max(NAV_MIN - now, MOUNT_MIN - (now - mounted), 0);
      timers.current.push(
        setTimeout(() => {
          clearTimeout(cap);
          toGreet();
        }, wait)
      );
    });

    // Skip on any deliberate input.
    const onKey = (event) => {
      if (event.key === "Tab") return;
      finish();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", finish);
    window.addEventListener("wheel", finish, { passive: true });

    // Counter and module lines run on a real clock, not animation delays: if
    // the main thread stalls while the bundle boots, they resume where they
    // should be rather than starting late.
    let frame = 0;
    const step = () => {
      // performance.now() is already navigation-relative, which is what the
      // meter and the module lines should follow.
      const elapsed = performance.now();
      const t = Math.min(1, elapsed / (NAV_MIN + GREET_MS * 0.8));
      const eased = 1 - Math.pow(1 - t, 2);
      // Never show 100% while the page is still arriving.
      const shown = readyRef.current ? eased : Math.min(eased, 0.93);
      if (percentRef.current) {
        percentRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      }
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${shown})`;
      if (linesRef.current) {
        const revealed = Math.min(copy.lines.length, Math.floor(elapsed / 250) + 1);
        linesRef.current.style.setProperty("--step", String(revealed));
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("wheel", finish);
    };
  }, [copy.lines.length, onDone, onReveal]);

  const words = copy.greeting.split(/\s+/);

  return (
    <div
      className={styles.intro}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label={copy.label}
    >
      <div className={styles.panels} aria-hidden="true">
        <span style={{ "--i": 0 }} />
        <span style={{ "--i": 1 }} />
        <span style={{ "--i": 2 }} />
        <span style={{ "--i": 3 }} />
      </div>

      <div className={styles.inner}>
        <p className={styles.brand} dir="ltr">
          <span>~</span>/nizar_
        </p>

        {/* The prompt line is painted with the first frame; the rest arrive on the clock. */}
        <ol className={styles.lines} ref={linesRef} style={{ "--step": 1 }}>
          {copy.lines.map((line, i) => (
            <li key={line.label} style={{ "--i": i }}>
              <span className={styles.lineLabel} dir={line.value ? undefined : "ltr"}>
                {line.label}
              </span>
              {line.value ? <span className={styles.lineValue}>{line.value}</span> : null}
              {line.value ? (
                <span className={styles.lineOk} aria-hidden="true">
                  ok
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <p className={styles.greeting} aria-label={copy.greeting}>
          {words.map((word, i) => (
            <span className={styles.word} key={`${word}-${i}`} style={{ "--i": i }}>
              <span aria-hidden="true">{word}</span>
            </span>
          ))}
        </p>

        <p className={styles.signature}>{copy.signature}</p>

        <div className={styles.footer}>
          <span className={styles.meter} aria-hidden="true">
            <span ref={meterRef} />
          </span>
          <span className={styles.percent} ref={percentRef} aria-hidden="true">
            000
          </span>
          <button className={styles.skip} type="button" ref={skipRef}>
            {copy.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
