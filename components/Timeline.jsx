import { GraduationCap, BriefcaseBusiness, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import styles from "./Timeline.module.css";

export default function Timeline({ copy, id, variant, index }) {
  const Icon = variant === "education" ? GraduationCap : BriefcaseBusiness;

  return (
    <Section id={id} index={index} kicker={copy.eyebrow} title={copy.title}>
      <ol className={styles.rail}>
        {copy.items.map((item, position) => (
          <Reveal
            as="li"
            className={styles.entry}
            key={`${item.title}-${item.date}`}
            delay={position * 60}
          >
            <div className={styles.marker} aria-hidden="true">
              <Icon size={15} />
            </div>

            <article className={styles.card}>
              <header className={styles.head}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={`${styles.date} u-mono`}>{item.date}</p>
              </header>

              <p className={styles.company}>
                <MapPin size={13} aria-hidden="true" />
                {item.company}
              </p>

              <ul className={styles.points}>
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
