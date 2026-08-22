import Image from "next/image";
import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { profileImage } from "@/data/portfolio";
import styles from "./About.module.css";

export default function About({ copy, portraitAlt, index }) {
  return (
    <Section id="about" index={index} kicker={copy.eyebrow} title={copy.title}>
      <div className={styles.grid}>
        <Reveal className={styles.prose}>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>

        <Reveal className={styles.panel} delay={80}>
          <div className={styles.portraitFrame}>
            <Image
              className={styles.portrait}
              src={profileImage}
              alt={portraitAlt}
              width={480}
              height={480}
              sizes="(max-width: 767px) 88vw, 320px"
            />
          </div>

          <div className={styles.panelBody}>
            <p className="u-signal-pill u-mono">
              <span className="u-signal-dot" aria-hidden="true" />
              {copy.availability}
            </p>

            <h3 className={styles.panelTitle}>{copy.cardTitle}</h3>
            <p className={styles.panelMeta}>{copy.cardMeta}</p>

            <ul className={styles.highlights}>
              {copy.highlights.map((item) => (
                <li className={styles.highlight} key={item}>
                  <Check size={15} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
