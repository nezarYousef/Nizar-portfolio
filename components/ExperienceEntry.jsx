import styles from "./ExperienceRoad.module.css";

/*
 * One station on the road. Role first, then who and when, then what was done,
 * then the stack. Its arrival and departure are driven by `--i` against the
 * road's progress, in CSS.
 */
export default function ExperienceEntry({ item, index, total, first, last, techLabel }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <li
      className={styles.station}
      style={{ "--i": index }}
      data-first={first ? "true" : undefined}
      data-last={last ? "true" : undefined}
    >
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
        {item.points.map((point, j) => (
          <li key={point} style={{ "--j": j }}>
            {point}
          </li>
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
    </li>
  );
}
