"use client";

import { useRef } from "react";
import ExperienceEntry from "@/components/ExperienceEntry";
import SectionHeading from "@/components/SectionHeading";
import { useScrollProgress } from "@/lib/scrollProgress";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./ExperienceRoad.module.css";

/*
 * Experience as a road you travel rather than a list you scroll.
 *
 * The stage pins for a few viewport-heights. Inside it the road surface holds
 * still while the mileposts travel up past a fixed marker, and each station
 * hands over to the next with a real transition: the outgoing one lifts and
 * fades while the incoming one arrives from below, windows overlapping by about
 * a fifth of a slice so the stage is never empty.
 *
 * One eased progress value (`--p`) drives all of it in CSS, so scrolling never
 * re-renders React and there is no animation that the scroll is not driving.
 * On a viewport too short to hold a station without clipping it, and under
 * `prefers-reduced-motion`, the same markup falls back to a static rail with
 * the stations stacked.
 */
export default function ExperienceRoad({ copy, language }) {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const roomToPin = useMediaQuery(
    // Narrow columns wrap the longest station into a taller card, so a short
    // phone needs more height than a short laptop before the road can be
    // pinned without clipping it.
    "((min-height: 820px) or ((min-width: 900px) and (min-height: 720px)))" +
      " and (prefers-reduced-motion: no-preference)",
    false
  );
  const items = copy.items;
  const total = items.length;
  const pinned = roomToPin && !reducedMotion;

  useScrollProgress(sectionRef, {
    mode: pinned ? "pin" : "read",
    disabled: reducedMotion,
    resetTo: pinned ? 0 : 1,
    // A touch softer than the page default: this act is a drive, not a flick.
    ease: 9
  });
  useReveal(sectionRef, [language]);

  return (
    <section
      className={`section band ${pinned ? "" : "screen"} ${styles.section}`}
      id="experience"
      ref={sectionRef}
      data-pinned={pinned}
      style={{ "--n": total }}
      aria-labelledby="experience-title"
    >
      <div className={styles.stage}>
        <div className="container">
          <SectionHeading
            index="04"
            eyebrow={copy.eyebrow}
            title={copy.title}
            id="experience-title"
            className={styles.head}
          />
        </div>

        <div className={`container ${styles.road}`}>
          {/* The surface is continuous; the mileposts are what move. */}
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.marker} />
            <div className={styles.track}>
              {items.map((item, index) => (
                <span
                  className={styles.stop}
                  key={`${item.title}-${item.date}`}
                  style={{ "--i": index }}
                >
                  <i />
                  <em>{item.date}</em>
                </span>
              ))}
            </div>
          </div>

          <ol className={styles.stations}>
            {items.map((item, index) => (
              <ExperienceEntry
                key={`${item.title}-${item.date}`}
                item={item}
                index={index}
                total={total}
                first={index === 0}
                last={index === total - 1}
                techLabel={copy.techLabel}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
