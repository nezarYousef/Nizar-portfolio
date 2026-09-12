"use client";

import { useRef } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useReveal } from "@/lib/useReveal";
import styles from "./Education.module.css";

/*
 * Education is reference material, not a journey, so it stays still: two
 * records side by side, dated, with the coursework underneath. Deliberately
 * the quietest device on the page.
 */
export default function Education({ copy, language }) {
  const sectionRef = useRef(null);
  useReveal(sectionRef, [language]);

  return (
    <section
      className="section screen"
      id="education"
      ref={sectionRef}
      aria-labelledby="education-title"
    >
      <div className="container">
        <SectionHeading index="05" eyebrow={copy.eyebrow} title={copy.title} id="education-title" />

        <ol className={styles.records}>
          {copy.items.map((item, i) => (
            <li
              className={styles.record}
              key={`${item.title}-${item.date}`}
              data-reveal=""
              style={{ "--delay": `${i * 80}ms` }}
            >
              <p className={styles.date}>{item.date}</p>
              <h3 className={styles.degree}>{item.title}</h3>
              <p className={styles.school}>{item.company}</p>
              <ul className={styles.points}>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
