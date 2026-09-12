"use client";

import { useEffect, useRef, useState } from "react";
import FieldCard from "@/components/FieldCard";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { useMediaQuery } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./OtherExperience.module.css";

/*
 * Field work reads as breadth rather than hierarchy, so it travels sideways:
 * on tall desktop screens the rail is pinned and panned by vertical scroll; on
 * touch and small screens it degrades to a native swipe rail with snapping.
 * Either way the page keeps scrolling normally.
 */
export default function OtherExperience({ copy, dir, language }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);
  const canPan = useMediaQuery(
    "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)",
    false
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () =>
      setTravel(Math.max(0, Math.round(track.scrollWidth - window.innerWidth)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [canPan, language]);

  const pinned = canPan && travel > 40;
  useScrollProgress(sectionRef, { mode: "pin", disabled: !pinned, resetTo: 0 });
  useReveal(sectionRef, [language]);

  return (
    <section
      className={`section band ${pinned ? "" : "screen"} ${styles.section}`}
      id="other-experience"
      ref={sectionRef}
      data-pinned={pinned}
      style={{ "--travel": `${travel}px`, "--dir": dir === "rtl" ? 1 : -1 }}
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

        <div
          className={styles.viewport}
          tabIndex={pinned ? undefined : 0}
          role={pinned ? undefined : "group"}
          aria-label={copy.eyebrow}
        >
          <ol className={styles.track} ref={trackRef}>
            {copy.items.map((item, i) => (
              <FieldCard item={item} index={i} key={item.title} />
            ))}
          </ol>
        </div>

        {pinned ? (
          <div className="container">
            <div className={styles.meter} aria-hidden="true">
              <span />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
