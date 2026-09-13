import styles from "./Footer.module.css";

export default function Footer({ text }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>&copy; {text}</p>
        <a className={styles.brand} href="#hero">
          <span>~</span>/nizar_
        </a>
      </div>
    </footer>
  );
}
