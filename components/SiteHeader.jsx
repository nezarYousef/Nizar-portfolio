"use client";

import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

const THEME_KEY = "nizar-portfolio-theme";

/* Active-section tracking is an IntersectionObserver, not a scroll listener:
   nothing measures layout on a scroll event any more. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (!visible.size) return;
        const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
        setActive(best[0]);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.05, 0.25, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Persistence is a progressive enhancement. */
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}

export default function SiteHeader({ copy, ui, sectionIds, otherLangHref }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const close = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label={ui.mainNavLabel}>
        <a className={styles.brand} href="#hero" onClick={() => setMenuOpen(false)}>
          <span className={`${styles.brandMark} u-mono`} aria-hidden="true">
            /
          </span>
          <span className={styles.brandName}>{copy.brand}</span>
        </a>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav-links"
          aria-label={menuOpen ? copy.controls.closeMenuLabel : copy.controls.menuLabel}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        </button>

        <ul
          className={styles.links}
          id="site-nav-links"
          data-open={menuOpen ? "true" : "false"}
        >
          {copy.nav.map((item) => (
            <li key={item.id}>
              <a
                className={styles.link}
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.controls}>
          <a
            className={styles.control}
            href={otherLangHref}
            aria-label={copy.controls.languageLabel}
            title={copy.controls.languageLabel}
            hrefLang={copy.controls.language.toLowerCase()}
          >
            <Languages size={17} aria-hidden="true" />
            <span className="u-mono">{copy.controls.language}</span>
          </a>

          <button
            className={styles.control}
            type="button"
            aria-label={copy.controls.themeLabel}
            title={copy.controls.themeLabel}
            aria-pressed={theme === "dark"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun size={17} aria-hidden="true" />
            ) : (
              <Moon size={17} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
