"use client";

import { useEffect, useState } from "react";
import styles from "./SectionRail.module.css";

/* Decorative position indicator for the left rail. It is aria-hidden because
   it duplicates the header navigation, which is already keyboard operable and
   announced - two navigation landmarks saying the same thing is noise. */
export default function SectionRail({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const nodes = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    const ratios = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ratios.set(entry.target.id, entry.intersectionRatio);
          } else {
            ratios.delete(entry.target.id);
          }
        });

        if (!ratios.size) return;
        setActive([...ratios.entries()].sort((a, b) => b[1] - a[1])[0][0]);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.3, 0.7] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className={styles.rail} aria-hidden="true">
      <ul className={styles.list}>
        {sections.map((section, position) => (
          <li key={section.id}>
            <a
              className={styles.item}
              href={`#${section.id}`}
              data-active={active === section.id ? "true" : "false"}
              tabIndex={-1}
            >
              <span className={`${styles.index} u-mono`}>
                {String(position + 1).padStart(2, "0")}
              </span>
              <span className={styles.mark} />
              <span className={styles.label}>{section.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
