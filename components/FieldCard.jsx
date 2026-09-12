import BlurImage from "@/components/BlurImage";
import styles from "./OtherExperience.module.css";

/* One card on the horizontal rail. Same shape every time, so the eye can
   compare them as they pass. */
export default function FieldCard({ item, index }) {
  return (
    <li className={styles.card} data-reveal="" style={{ "--delay": `${index * 70}ms` }}>
      <div className={styles.photo}>
        <BlurImage
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="(max-width: 680px) 82vw, 400px"
          loading="lazy"
          className={styles.image}
          style={{ objectPosition: item.imagePosition ?? "center" }}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.date}>{item.date}</p>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.org}>{item.company}</p>
        <ul className={styles.points}>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
