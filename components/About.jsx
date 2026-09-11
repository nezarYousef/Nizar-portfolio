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

  // Portrait parallax: the photo travels slower than its frame.
  useScrollProgress(figureRef, { mode: "through", disabled: reducedMotion, resetTo: 0.5 });
  useReveal(sectionRef, [language]);

  const [lead, ...rest] = copy.paragraphs;

  return (
    <section className="section" id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className="container">
        <SectionHeading index="01" eyebrow={copy.eyebrow} title={copy.title} id="about-title" ink />

        <div className={styles.grid}>
          <figure className={styles.figure} data-reveal="">
            <div className={styles.frame} ref={figureRef}>
              <div className={styles.photo}>
                <BlurImage
                  src={profileImage}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 900px) 88vw, 420px"
                  className={styles.image}
                />
              </div>
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {copy.badge}
              </span>
              <strong>{copy.cardTitle}</strong>
              <span>{copy.cardMeta}</span>
            </figcaption>
          </figure>

          <div className={styles.body}>
            <p className={styles.lead} data-reveal="">
              {lead}
            </p>
            {rest.map((paragraph, i) => (
              <p className={styles.paragraph} key={paragraph} data-reveal="" style={{ "--delay": `${(i + 1) * 60}ms` }}>
                {paragraph}
              </p>
            ))}

            <dl className={styles.facts} data-reveal="">
              {stats.map((stat) => (
                <div className={styles.fact} key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>

            <ul className={styles.highlights}>
              {copy.highlights.map((item, i) => (
                <li key={item} data-reveal="" style={{ "--delay": `${i * 50}ms` }}>
                  <Check size={17} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
