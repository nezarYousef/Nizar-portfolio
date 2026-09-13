"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./SectionHeading.module.css";

/*
 * The page has three heading voices and this component owns two of them:
 * `statement` (About, Contact) and the default section voice everywhere else.
 * The hero owns the third. An eyebrow carries the index and the label, so the
 * heading itself never has to shout.
 *
 * `ink` scrubs the words from muted to full ink as the heading rises.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  id,
  ink = false,
  statement = false,
  hideTitle = false,
  className = ""
}) {
  const ref = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useScrollProgress(ref, {
    mode: "enter",
    span: 0.75,
    disabled: !ink || hideTitle || reducedMotion,
    resetTo: 1
  });

  const words = ink && !hideTitle ? title.split(/\s+/) : null;
  const voice = statement ? "statement" : "title";

  return (
    <div ref={ref} className={`${styles.heading} ${className}`} data-reveal={ink ? undefined : ""}>
      {eyebrow ? (
        <p className="kicker">
          {index ? <b>{index}</b> : null}
          <span>{eyebrow}</span>
        </p>
      ) : null}
      {/*
       * Some sections (About) carry the section's accessible name here
       * without showing it as a second, competing headline: the kicker
       * already reads as the heading, and the bio underneath speaks for
       * itself. The <h2> stays in the DOM for landmark labelling and
       * screen readers, just visually hidden.
       */}
      <h2 className={hideTitle ? "sr-only" : `${voice} ${ink ? styles.ink : ""}`} id={id}>
        {hideTitle ? (
          title
        ) : ink ? (
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
