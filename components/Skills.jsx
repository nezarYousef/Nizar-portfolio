"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import SkillPanel from "@/components/SkillPanel";
import { useReveal } from "@/lib/useReveal";
import styles from "./Skills.module.css";

/*
 * The stack, as five panels rather than a table of bars. Scrolling emphasises
 * one category at a time; nothing else on the panel moves.
 */
export default function Skills({ copy, language }) {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const [active, setActive] = useState(0);

  useReveal(sectionRef, [language]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return undefined;
    const panels = Array.from(list.children);
    // A thin band across the middle of the viewport: whatever is in it is
    // what the visitor is reading.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(panels.indexOf(entry.target));
        });
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [copy.categories, language]);

  return (
    <section
      className="section screen band"
      id="skills"
      ref={sectionRef}
      aria-labelledby="skills-title"
    >
      <div className="container">
        <SectionHeading index="02" eyebrow={copy.eyebrow} title={copy.title} id="skills-title" />

        <ol className={styles.list} ref={listRef}>
          {copy.categories.map((category, index) => (
            <SkillPanel
              key={category.key}
              category={category}
              index={index}
              active={index === active}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
