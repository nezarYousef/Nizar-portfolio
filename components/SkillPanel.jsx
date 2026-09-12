import styles from "./SkillPanel.module.css";

/*
 * One category of the stack: index, title, one line of context, and the
 * technologies themselves. The panel that crosses the middle of the viewport
 * is marked active by the parent, which is the only thing that moves.
 */
export default function SkillPanel({ category, index, active }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <li
      className={styles.panel}
      data-active={active ? "true" : undefined}
      data-reveal=""
      style={{ "--swatch": `var(--mod-${category.key})`, "--delay": `${index * 60}ms` }}
    >
      <span className={styles.rail} aria-hidden="true" />

      <p className={styles.index} aria-hidden="true">
        {number}
      </p>

      <div className={styles.head}>
        <h3 className={styles.name}>
          <span className="sr-only">{`${number}. `}</span>
          {category.title}
        </h3>
        <p className={styles.blurb}>{category.blurb}</p>
      </div>

      <ul className={`tags ${styles.tags}`} aria-label={category.title}>
        {category.items.map((item) => (
          <li className="tag" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </li>
  );
}
