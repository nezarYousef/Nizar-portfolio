import { heroModules } from "@/data/portfolio";
import styles from "./HeroFallback.module.css";

/*
 * Shown when WebGL is unavailable. Same modules, same identity, laid out as a
 * layered CSS composition so the hero never renders empty.
 */
export default function HeroFallback() {
  const modules = heroModules.filter((module) => module.kind !== "terminal").slice(0, 4);

  return (
    <div className={styles.fallback} aria-hidden="true">
      {modules.map((module, index) => (
        <div
          className={styles.card}
          key={module.id}
          style={{ "--i": index, "--swatch": `var(--mod-${module.swatch})` }}
        >
          <span className={styles.swatch} />
          <small>{module.label}</small>
          <strong>{module.value}</strong>
        </div>
      ))}
    </div>
  );
}
