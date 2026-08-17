import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import styles from "./OtherExperience.module.css";

/* The track is rendered twice on purpose: the duplicate is what makes the
   marquee loop seamlessly, and it carries aria-hidden so assistive tech only
   ever encounters each entry once. */
export default function OtherExperience({ copy, index }) {
  return (
    <Section
      id="other-experience"
      index={index}
      kicker={copy.eyebrow}
      title={copy.title}
    >
      <Reveal className={styles.viewport}>
        <div className={styles.track}>
          {[0, 1].map((group) => (
            <div
              className={styles.group}
              key={group}
              aria-hidden={group === 1 ? "true" : undefined}
            >
              {copy.items.map((item) => (
                <article className={styles.card} key={`${item.title}-${group}`}>
                  <div className={styles.imageFrame}>
                    <Image
                      className={styles.image}
                      src={item.image}
                      alt={group === 1 ? "" : item.imageAlt}
                      width={520}
                      height={320}
                      sizes="(max-width: 679px) 280px, 340px"
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
                </article>
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
