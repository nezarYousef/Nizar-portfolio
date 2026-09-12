import styles from "./ExperienceRoad.module.css";

/*
 * One stop on the road. Role first, then who and when, then what was done,
 * then the stack. Scannable in a few seconds; nothing here is a paragraph.
 */
export default function ExperienceEntry({ item, index, total, active, techLabel }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <li className={styles.entry} data-active={active ? "true" : undefined} data-reveal="">
      <span className={styles.node} aria-hidden="true">
        <i />
      </span>

      <div className={styles.card}>
        <p className={styles.meta}>
          <span className={styles.step} aria-hidden="true">
            {number}
            <i>{`/${String(total).padStart(2, "0")}`}</i>
          </span>
          <span className={styles.date}>{item.date}</span>
        </p>

        <h3 className={styles.role}>{item.title}</h3>
        <p className={styles.org}>{item.company}</p>

        <ul className={styles.points}>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        {item.tech?.length ? (
          <div className={styles.stack}>
            <span className="tag-label">{techLabel}</span>
            <ul className="tags">
              {item.tech.map((name) => (
                <li className="tag" key={name}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  );
}
