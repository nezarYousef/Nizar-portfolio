"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceEntry from "@/components/ExperienceEntry";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./ExperienceRoad.module.css";

/*
 * Experience as a road rather than a list. The heading and a stage marker hold
 * their place while the page scrolls normally past them; the rail fills as you
 * read, and the stop you are level with is the one in focus. The page never
 * takes the scroll away from the visitor.
 */
export default function ExperienceRoad({ copy, language }) {
  const sectionRef = useRef(null);
  const roadRef = useRef(null);
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const items = copy.items;

  useScrollProgress(roadRef, { mode: "read", disabled: reducedMotion, resetTo: 1 });
  useReveal(sectionRef, [language]);

  useEffect(() => {
    const road = roadRef.current;
    if (!road || !("IntersectionObserver" in window)) return undefined;
    const stops = Array.from(road.children);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(stops.indexOf(entry.target));
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    stops.forEach((stop) => observer.observe(stop));
    return () => observer.disconnect();
  }, [items, language]);

  const current = items[active] ?? items[0];

  return (
    <section
      className="section screen band"
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-title"
    >
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <SectionHeading
            index="04"
            eyebrow={copy.eyebrow}
            title={copy.title}
            id="experience-title"
          />

          {/* Where you are on the road. Mirrors the rail, never replaces it. */}
          <div className={styles.marker} aria-hidden="true">
            <p className={styles.markerCount}>
              {String(active + 1).padStart(2, "0")}
              <span>{` / ${String(items.length).padStart(2, "0")}`}</span>
            </p>
            <p className={styles.markerRole}>{current.title}</p>
            <p className={styles.markerDate}>{current.date}</p>
          </div>
        </div>

        <ol className={styles.road} ref={roadRef}>
          {items.map((item, index) => (
            <ExperienceEntry
              key={`${item.title}-${item.date}`}
              item={item}
              index={index}
              total={items.length}
              active={index === active}
              techLabel={copy.techLabel}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
