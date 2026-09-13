"use client";

import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./Navigation.module.css";

export default function Navigation({
  activeSection,
  copy,
  language,
  onLanguageChange,
  onThemeChange,
  theme
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const progressRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const nextLanguage = language === "en" ? "ar" : "en";
  const nextTheme = theme === "dark" ? "light" : "dark";

  // Compact header + reading progress, one rAF-throttled listener, no re-render
  // per scroll tick (the bar is written directly).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      setCompact(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Mobile menu: lock scroll, close on Escape, return focus to the toggle.
  useEffect(() => {
    if (!menuOpen) return undefined;
    document.body.classList.add("is-locked");
    const first = menuRef.current?.querySelector("a");
    first?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 980) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const links = copy.nav.map((item, index) => ({
    ...item,
    index: String(index + 1).padStart(2, "0")
  }));

  return (
    <>
      <div className={styles.progress} ref={progressRef} aria-hidden="true" />

      <header className={styles.header} data-compact={compact || menuOpen}>
        <nav className={`container ${styles.bar}`} aria-label="Main">
          <a className={styles.brand} href="#hero" onClick={() => setMenuOpen(false)}>
            <span className={styles.brandMark}>~</span>/nizar<span className={styles.brandCursor}>_</span>
            <span className="sr-only">{copy.brand}</span>
          </a>

          <ul className={styles.links}>
            {links.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.link}
                  aria-current={activeSection === item.id ? "true" : undefined}
                >
                  <span className={styles.index}>{item.index}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.controls}>
            <button
              className={`icon-btn ${styles.lang}`}
              type="button"
              aria-label={copy.controls.languageLabel}
              title={copy.controls.languageLabel}
              onClick={() => onLanguageChange(nextLanguage)}
            >
              <Languages size={17} aria-hidden="true" />
              <span>{copy.controls.language}</span>
            </button>

            <button
              className="icon-btn"
              type="button"
              aria-label={copy.controls.themeLabel}
              title={copy.controls.themeLabel}
              onClick={() => onThemeChange(nextTheme)}
            >
              {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>

            <button
              ref={toggleRef}
              className={`icon-btn ${styles.menuToggle}`}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? copy.controls.closeMenuLabel : copy.controls.menuLabel}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        className={styles.sheet}
        data-open={menuOpen}
        inert={menuOpen ? undefined : true}
      >
        <ul className={`container ${styles.sheetList}`}>
          {links.map((item, i) => (
            <li key={item.id} style={{ "--i": i }}>
              <a
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "true" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.index}>{item.index}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
