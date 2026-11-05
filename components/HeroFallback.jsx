import { heroModules } from "@/data/portfolio";
import { Cpu, LaptopMinimal } from "lucide-react";
import styles from "./HeroFallback.module.css";

/*
 * Shown when WebGL is unavailable. Same modules, same identity, laid out as a
 * layered CSS composition so the hero never renders empty.
 */
export default function HeroFallback() {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <div className={styles.hardware}>
        <LaptopMinimal size={176} strokeWidth={0.8} />
        <Cpu className={styles.processor} size={38} strokeWidth={1.2} />
      </div>
      {heroModules.map((module, index) => (
        <div
          className={styles.card}
          key={module.id}
          style={{ "--i": index, "--swatch": `var(--mod-${module.swatch ?? "tools"})` }}
        >
          <span className={styles.swatch} />
          <small>{module.label ?? module.command}</small>
          <strong>{module.value ?? module.output}</strong>
        </div>
      ))}
    </div>
  );
}
