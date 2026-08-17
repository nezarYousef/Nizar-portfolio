import Reveal from "@/components/Reveal";
import styles from "./Section.module.css";

/* Consistent section rhythm and heading structure in one place, so every
   section gets the same vertical band, the same kicker/title pairing and a
   correct <h2> without each component reinventing it. */
export default function Section({
  id,
  index,
  kicker,
  title,
  children,
  headingId,
  className = ""
}) {
  const labelId = headingId ?? `${id}-title`;

  return (
    <section
      className={`${styles.section} ${className}`.trim()}
      id={id}
      aria-labelledby={labelId}
    >
      <div className={styles.inner}>
        <Reveal className={styles.heading}>
          <p className={`${styles.kicker} u-mono`}>
            {index ? <span className={styles.index}>{index}</span> : null}
            {kicker}
          </p>
          <h2 className={styles.title} id={labelId}>
            {title}
          </h2>
        </Reveal>

        {children}
      </div>
    </section>
  );
}
