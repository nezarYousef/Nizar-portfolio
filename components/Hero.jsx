import { ArrowRight, Mail } from "lucide-react";
import HeroVisual from "@/components/hero/HeroVisual";
import styles from "./Hero.module.css";

/* Server component. The only client code in the hero is the decorative
   canvas; every word here is in the static HTML. */
export default function Hero({ copy, ui }) {
  return (
    <section className={styles.hero} id="hero">
      <HeroVisual label={ui.decorativeVisual} />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} u-mono`}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h1 className={styles.name}>
            <span className={styles.typeOnce}>{copy.name}</span>
          </h1>

          <p className={styles.lead}>{copy.title}</p>

          <ul className={styles.identity}>
            <li className={`${styles.identityItem} u-mono`}>{copy.identity}</li>
            <li className={`${styles.status} u-mono`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {copy.status}
            </li>
          </ul>

          <p className={styles.description}>{copy.description}</p>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#projects">
              <span>{copy.primaryAction}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className={styles.secondaryAction} href="#contact">
              <Mail size={17} aria-hidden="true" />
              <span>{copy.secondaryAction}</span>
            </a>
          </div>

          <dl className={styles.stats}>
            {copy.stats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={`${styles.statValue} u-mono`}>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
