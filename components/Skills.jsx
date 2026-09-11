"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./Skills.module.css";

// v1 category colours, in the same order (teal, blue, violet, green, rust, tools).
const SWATCHES = [
  "var(--mod-web)",
  "var(--mod-data)",
  "var(--mod-ai)",
  "var(--mod-vision)",
  "var(--mod-systems)",
  "var(--mod-tools)"
];

const itemName = (item) => (typeof item === "string" ? item : item.name);

export default function Skills({ copy, language }) {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  useReveal(sectionRef, [language]);
  const reducedMotion = usePrefersReducedMotion();

  // Rows slide into the sheet by scroll position (scrubbed, not timed).
  useScrollProgress(listRef, { mode: "enter", span: 0.95, disabled: reducedMotion, resetTo: 1 });

  return (
    <section className="section" id="skills" ref={sectionRef} aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading index="02" eyebrow={copy.eyebrow} title={copy.title} id="skills-title" />

        <ol className={styles.sheet} ref={listRef} style={{ "--n": copy.categories.length }}>
          {copy.categories.map((category, index) => (
            <li
              className={styles.row}
              key={category.title}
              style={{ "--i": index, "--swatch": SWATCHES[index % SWATCHES.length] }}
            >
              <span className={styles.swatch} aria-hidden="true" />
              <h3 className={styles.name}>{category.title}</h3>
              <ul className={styles.items} aria-label={category.title}>
                {category.items.map((item) => (
                  <li key={itemName(item)}>{itemName(item)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
