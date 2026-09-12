"use client";

import { Check } from "lucide-react";
import { useRef } from "react";
import BlurImage from "@/components/BlurImage";
import SectionHeading from "@/components/SectionHeading";
import { profileImage } from "@/data/portfolio";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import { useReveal } from "@/lib/useReveal";
import styles from "./About.module.css";

export default function About({ copy, stats, imageAlt, language }) {
  const sectionRef = useRef(null);
  const figureRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  /* The mounted portrait drifts against its column. The crop itself never
     moves: the source photo has very little room above the head, so any
     parallax inside the frame would clip it. */
  useScrollProgress(figureRef, { mode: "through", disabled: reducedMotion, resetTo: 0.5 });
  useReveal(sectionRef, [language]);

  const [lead, ...rest] = copy.paragraphs;

  return (
    <section className="section screen" id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          index="01"
          eyebrow={copy.eyebrow}
          title={copy.title}
          id="about-title"
          ink
          statement
          className={styles.heading}
        />

        <div className={styles.grid}>
          <figure className={styles.figure} data-reveal="">
            <div className={styles.mount} ref={figureRef}>
              <div className={styles.frame}>
                <BlurImage
                  src={profileImage}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 900px) 70vw, 380px"
                  className={styles.image}
                />
              </div>
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {copy.badge}
              </span>
            </div>

            <figcaption className={styles.caption}>
              <strong>{copy.cardTitle}</strong>
              <span>{copy.cardMeta}</span>
            </figcaption>
          </figure>

          <div className={styles.body}>
            <p className={styles.lead} data-reveal="">
              {lead}
            </p>
            {rest.map((paragraph, i) => (
              <p
                className={styles.paragraph}
                key={paragraph}
                data-reveal=""
                style={{ "--delay": `${(i + 1) * 60}ms` }}
              >
                {paragraph}
              </p>
            ))}

            <ul className={styles.highlights}>
              {copy.highlights.map((item, i) => (
                <li key={item} data-reveal="" style={{ "--delay": `${i * 50}ms` }}>
                  <Check size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <dl className={styles.facts} data-reveal="">
          {stats.map((stat) => (
            <div className={styles.fact} key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
