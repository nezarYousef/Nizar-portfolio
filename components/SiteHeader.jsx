"use client";

import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const fadeTimer = useRef(0);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
    return () => clearTimeout(fadeTimer.current);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      const root = document.documentElement;

      /* Brief global cross-fade so surfaces don't snap between palettes.
         The class scopes the transition to this one flip; globals.css owns
         the actual rule and reduced-motion gating. */
      root.classList.add("theme-fade");
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* Persistence is a progressive enhancement. */
      }
      clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => root.classList.remove("theme-fade"), 350);

      return next;
    });
  }, []);

  return [theme, toggle];
}

export default function SiteHeader({ copy, ui, sectionIds, otherLangHref }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const active = useActiveSection(sectionIds);
  const progressRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);

  /* Close-with-focus: every intentional close hands focus back to the
     hamburger so keyboard users never land on <body>. Resize-driven closes
     stay silent - nobody asked for focus. */
  const closeMenu = useCallback((refocus = false) => {
    setMenuOpen(false);
    if (refocus) menuButtonRef.current?.focus();
  }, []);

  /* Reading progress: one passive scroll listener, rAF-batched, writing a
      transform directly - no React state on the hot path. Decorative (the
      browser already communicates position), so it stays aria-hidden. */
  useEffect(() => {
    let queued = false;
    let frame = 0;

    const update = () => {
      queued = false;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${value})`;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* Crossing into the desktop nav (>= 1024px, matching the CSS breakpoint)
     retires the drawer. matchMedia instead of a magic width keeps the JS and
     the stylesheet on one source of truth. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Drawer behaviour while open: Escape closes (with focus restored), Tab is
     trapped across the header's controls so keyboard users can reach the
     language/theme buttons without escaping into the page behind. */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const focusable = () => {
      const nav = navRef.current;
      if (!nav) return [];
      return [
        ...nav.querySelectorAll("a[href], button:not([disabled])")
      ];
    };

    const onKey = (event) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !navRef.current?.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    /* Opening moves focus into the menu itself, mirroring native disclosure
       widgets. The drawer is CSS-shown via data-open; by effect time it is
       rendered and focusable. */
    document.getElementById("site-nav-links")?.querySelector("a")?.focus();

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <header className={styles.header} id="site-header">
      <nav
        ref={navRef}
        className={styles.nav}
        aria-label={ui.mainNavLabel}
      >
        <a
          className={styles.brand}
          href="#hero"
          onClick={() => closeMenu()}
        >
          <span className={`${styles.brandMark} u-mono`} aria-hidden="true">
            /
          </span>
          <span className={styles.brandName}>{copy.brand}</span>
        </a>

        <button
          ref={menuButtonRef}
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
                onClick={() => closeMenu(true)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.controls}>
          {/* The accessible name has to contain the visible text (WCAG 2.5.3),
              so the "EN"/"AR" token is prefixed rather than replaced. */}
          <a
            className={styles.control}
            href={otherLangHref}
            aria-label={`${copy.controls.language} - ${copy.controls.languageLabel}`}
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

      <div className={styles.progress} aria-hidden="true">
        <div ref={progressRef} className={styles.progressBar} />
      </div>
    </header>
  );
}
