"use client";

import { useEffect, useRef, useState } from "react";
import BlurImage from "@/components/BlurImage";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { useMediaQuery } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./OtherExperience.module.css";

/*
 * Field work reads as breadth, not hierarchy, so it travels sideways. On tall
 * desktop screens the rail is pinned and scrubbed by vertical scroll; on touch
 * and small screens it is a native swipe rail.
 */
export default function OtherExperience({ copy, dir, language }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);
  const canPan = useMediaQuery(
    "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)",
    false
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () => setTravel(Math.max(0, Math.round(track.scrollWidth - window.innerWidth)));
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
      className={`section ${styles.section}`}
      id="other-experience"
      ref={sectionRef}
      data-pinned={pinned}
      style={{ "--travel": `${travel}px`, "--dir": dir === "rtl" ? 1 : -1 }}
      aria-labelledby="other-experience-title"
    >
      <div className={styles.stage}>
        <div className="container">
          <SectionHeading
            index="05"
            eyebrow={copy.eyebrow}
            title={copy.title}
            id="other-experience-title"
            className={styles.heading}
          />
        </div>

        <div className={styles.viewport} tabIndex={pinned ? undefined : 0} aria-label={copy.eyebrow}>
          <ol className={styles.track} ref={trackRef}>
            {copy.items.map((item, i) => (
              <li className={styles.card} key={item.title} data-reveal="" style={{ "--delay": `${i * 70}ms` }}>
                <div className={styles.photo}>
                  <BlurImage
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 680px) 82vw, 400px"
                    className={styles.image}
                    style={{ objectPosition: item.imagePosition ?? "center" }}
                  />
                </div>
                <div className={styles.body}>
                  <p className={styles.date}>{item.date}</p>
                  <h3 className={styles.title}>{item.title}</h3>
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
      </div>
    </section>
  );
}
