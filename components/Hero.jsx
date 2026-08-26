import { ArrowRight, Download } from "lucide-react";
import HeroVisual from "@/components/hero/HeroVisual";
import styles from "./Hero.module.css";

/* Server component. The only client code in the hero is the decorative
   canvas; every word here is in the static HTML.

   Column order (deliberate): eyebrow -> name -> one value-prop line ->
   identity chips -> stats -> CTAs. The long fundamentals paragraph and the
   second availability badge were removed to cut vertical clutter; the
   availability state lives once, in the Contact section and the assistant. */

export default function Hero({ copy, ui, skillWords, cvPath }) {
  return (
    <section className={styles.hero} id="hero">
      <HeroVisual label={ui.decorativeVisual} words={skillWords} />

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
            <li className={`${styles.role} u-mono`}>{copy.typedRole}</li>
            <li className={`${styles.identityItem} u-mono`}>{copy.identity}</li>
          </ul>

          <dl className={styles.stats}>
            {copy.stats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={`${styles.statValue} u-mono`}>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#projects">
              <span>{copy.primaryAction}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>

            {cvPath ? (
              <a
                className={styles.secondaryAction}
                href={cvPath}
                download
              >
                <Download size={17} aria-hidden="true" />
                <span>{copy.downloadCv}</span>
              </a>
            ) : (
              /* CV file not added yet: disabled placeholder, same convention
                 as the project buttons. Setting cvConfig.path enables it. */
              <button
                className={styles.secondaryAction}
                type="button"
                disabled
                aria-disabled="true"
                title={copy.downloadCv}
              >
                <Download size={17} aria-hidden="true" />
                <span>{copy.downloadCv}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
