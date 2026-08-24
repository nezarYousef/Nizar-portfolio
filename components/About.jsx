import Image from "next/image";
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
              width={898}
              height={1600}
              sizes="(max-width: 767px) 88vw, 320px"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
