"use client";

import { useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./TimelineSection.module.css";

/*
 * Experience and Education. The rail draws itself as you read (scroll-bound),
 * entries arrive once (medium motion), and nothing else moves.
 */
export default function TimelineSection({ copy, id, index, language }) {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useScrollProgress(listRef, { mode: "read", disabled: reducedMotion, resetTo: 1 });
  useReveal(sectionRef, [language]);

  return (
    <section className="section" id={id} ref={sectionRef} aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <SectionHeading index={index} eyebrow={copy.eyebrow} title={copy.title} id={`${id}-title`} />
        </div>

        <ol className={styles.timeline} ref={listRef}>
          {copy.items.map((item, i) => (
            <li className={styles.entry} key={`${item.title}-${item.date}`} data-reveal="" style={{ "--delay": `${i * 70}ms` }}>
              <span className={styles.node} aria-hidden="true" />
              <p className={styles.date}>{item.date}</p>
              <div className={styles.body}>
                <h3 className={styles.role}>{item.title}</h3>
                <p className={styles.org}>{item.company}</p>
                <ul className={styles.points}>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
