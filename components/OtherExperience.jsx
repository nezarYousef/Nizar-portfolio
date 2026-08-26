import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import styles from "./OtherExperience.module.css";

/* A plain responsive grid - one copy of every entry, no duplication, and no
   card is ever clipped at any viewport. The previous infinite marquee kept a
   hidden duplicate track and cut cards at both edges by design; the grid
   shows the same real photos and text, fully visible, in reading order. */
export default function OtherExperience({ copy, index }) {
  return (
    <Section
      id="other-experience"
      index={index}
      kicker={copy.eyebrow}
      title={copy.title}
    >
      <Reveal>
        <ul className={styles.grid}>
          {copy.items.map((item) => (
            <li className={styles.card} key={`${item.title}-${item.date}`}>
              <div className={styles.imageFrame}>
                <Image
                  className={styles.image}
                  src={item.image}
                  alt={item.imageAlt}
                  width={520}
                  height={320}
                  sizes="(max-width: 767px) 92vw, 380px"
                  style={{ objectPosition: item.imagePosition ?? "center" }}
                />
              </div>

              <div className={styles.body}>
                <header className={styles.head}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={`${styles.date} u-mono`}>
                    <CalendarDays size={13} aria-hidden="true" />
                    {item.date}
                  </p>
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
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
