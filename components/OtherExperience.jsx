"use client";

import { useEffect, useRef, useState } from "react";
import FieldCard from "@/components/FieldCard";
import SectionHeading from "@/components/SectionHeading";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./OtherExperience.module.css";

const SPEED = 42; // px per second
const RESUME_MS = 2200; // quiet period after the visitor moves the rail themselves

/*
 * Field work reads as breadth rather than hierarchy, so it travels sideways on
 * its own: a rail that drifts continuously and wraps without a seam.
 *
 * The list is rendered several times over and the drift steps back by exactly
 * one set when it reaches the end, so the loop is invisible. The drift is a
 * nudge to the container's own `scrollLeft`, which means a swipe, a trackpad
 * flick or the arrow keys still work and compose with it.
 *
 * It yields for a couple of seconds whenever the rail moves by anything other
 * than the drift itself, holds while something inside it has keyboard focus,
 * and stops while off screen, while the tab is hidden, and entirely under
 * `prefers-reduced-motion`. It deliberately does not pause on hover: on a
 * desktop the pointer rests over the middle of the page, so hovering would
 * mean the rail never moved at all.
 */
export default function OtherExperience({ copy, dir, language }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const loopRef = useRef(0);
  const [sets, setSets] = useState(2);
  const reducedMotion = usePrefersReducedMotion();
  const rtl = dir === "rtl";
  const items = copy.items;
  const count = items.length;

  useReveal(sectionRef, [language]);

  // One set is a full loop; we need enough of them that the tail of the rail
  // never shows bare ground on a wide screen.
  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return undefined;

    const measure = () => {
      const first = track.children[0];
      const next = track.children[count];
      if (!first || !next) return;
      // Subpixel: card widths and gaps are clamped viewport units, so the
      // period is rarely a whole number. Rounding it would leave the wrap a
      // fraction out of phase, and that error would accumulate.
      const loop = Math.abs(
        next.getBoundingClientRect().left - first.getBoundingClientRect().left
      );
      if (loop <= 0) return;
      loopRef.current = loop;
      setSets(Math.max(2, Math.ceil(viewport.clientWidth / loop) + 1));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [count, language]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || reducedMotion) return undefined;

    const sign = rtl ? -1 : 1;
    let frame = 0;
    let last = 0;
    let resumeAt = 0;
    let onScreen = true;
    let written = null;
    let focusHold = false;

    const step = (now) => {
      frame = requestAnimationFrame(step);
      // Capped so a stall never turns into a jump, but loose enough that a
      // 10fps device still drifts at the intended speed.
      const delta = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (!onScreen || document.hidden) {
        written = null;
        return;
      }

      const loop = loopRef.current;
      if (loop <= 0) return;

      // Start from what the browser actually has, so the visitor's own
      // scrolling is never fought, only continued.
      const actual = viewport.scrollLeft;

      /*
       * Yielding is decided by the rail's own position, not by input events.
       * If it moved since we last wrote it, something other than us moved it:
       * a drag, a trackpad swipe, the arrow keys. Watching events instead
       * would catch a plain vertical page scroll passing over the rail, which
       * is not the visitor asking the rail for anything.
       */
      if (written !== null && Math.abs(actual - written) > 2) {
        resumeAt = now + RESUME_MS;
      }

      let position = actual;
      const drifting = !focusHold && now >= resumeAt;
      if (drifting) position += sign * SPEED * delta;

      if (position >= loop) position -= loop;
      else if (position <= -loop) position += loop;

      if (drifting || Math.abs(position - actual) > 0.5) {
        viewport.scrollLeft = position;
        // Read back: the browser rounds and clamps.
        written = viewport.scrollLeft;
      } else {
        written = actual;
      }
    };
    frame = requestAnimationFrame(step);

    /*
     * A keyboard visit holds it outright: someone tabbing into the rail is
     * reading it. It has to be `:focus-visible` rather than plain focus,
     * because clicking or dragging the rail focuses it too, and that would
     * otherwise stop the drift for good. Hovering does not hold it at all, or
     * the drift would never start on a desktop, where the pointer rests over
     * the middle of the page.
     */
    const hold = () => {
      if (viewport.matches(":focus-visible")) focusHold = true;
    };
    const release = () => {
      focusHold = false;
    };

    viewport.addEventListener("focusin", hold);
    viewport.addEventListener("focusout", release);
    viewport.addEventListener("keyup", hold);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        last = 0;
      },
      { rootMargin: "140px 0px" }
    );
    observer.observe(viewport);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("focusin", hold);
      viewport.removeEventListener("focusout", release);
      viewport.removeEventListener("keyup", hold);
    };
  }, [count, reducedMotion, rtl, sets]);

  // Copies after the first are decoration: the content is already announced.
  const rail = Array.from({ length: sets }, (_, set) =>
    items.map((item) => (
      <FieldCard item={item} key={`${set}-${item.title}`} clone={set > 0} />
    ))
  ).flat();

  return (
    <section
      className={`section screen band ${styles.section}`}
      id="other-experience"
      ref={sectionRef}
      data-drifting={reducedMotion ? undefined : "true"}
      aria-labelledby="other-experience-title"
    >
      <div className={styles.stage}>
        <div className="container">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            id="other-experience-title"
            className={styles.heading}
          />
        </div>

        <div className={styles.viewport} ref={viewportRef} tabIndex={0} role="group" aria-label={copy.eyebrow}>
          <ol className={styles.track} ref={trackRef}>
            {rail}
          </ol>
        </div>
      </div>
    </section>
  );
}
