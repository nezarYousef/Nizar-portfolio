"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./SectionHeading.module.css";

/*
 * Kicker ("03 Featured Engineering Work", the v1 label) + section title.
 * `ink` turns the title into a scroll-scrubbed line: words fill from muted to
 * full ink as the heading rises through the viewport.
 */
export default function SectionHeading({ index, eyebrow, title, id, ink = false, className = "" }) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useScrollProgress(ref, { mode: "enter", span: 0.75, disabled: !ink || reducedMotion, resetTo: 1 });

  const words = ink ? title.split(/\s+/) : null;

  return (
    <div ref={ref} className={`${styles.heading} ${className}`} data-reveal={ink ? undefined : ""}>
      <p className="kicker">
        <b>{index}</b>
        <span>{eyebrow}</span>
      </p>
      <h2 className={`title ${ink ? styles.ink : ""}`} id={id}>
        {ink ? (
          <>
            <span className="sr-only">{title}</span>
            <span aria-hidden="true" style={{ "--n": words.length }}>
              {words.map((word, i) => (
                <span className={styles.word} style={{ "--i": i }} key={`${word}-${i}`}>
                  {word}{" "}
                </span>
              ))}
            </span>
          </>
        ) : (
          title
        )}
      </h2>
    </div>
  );
}
