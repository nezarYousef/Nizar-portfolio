"use client";

import { Languages, Menu, Moon, Sun, X, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navigation({
  activeSection,
  copy,
  language,
  onLanguageChange,
  onThemeChange,
  theme
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const closeOnLargeScreen = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener("resize", closeOnLargeScreen);
    return () => window.removeEventListener("resize", closeOnLargeScreen);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextLanguage = language === "en" ? "ar" : "en";
  const nextTheme = theme === "dark" ? "light" : "dark";
  const brandHandle = "~/nizar_";

  return (
    <>
      <style>{`
        .site-header {
          transition: box-shadow 300ms ease, background 300ms ease, border-color 300ms ease;
        }
        .site-header.is-scrolled {
          box-shadow: 0 4px 30px rgba(14, 165, 164, 0.08), 0 1px 0 var(--line);
        }
        .nav-links a {
          position: relative;
        }
        .nav-links a.is-active::before {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }
        .brand {
          transition: color 200ms ease;
        }
        .brand:hover .brand-mark {
          text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 70%, transparent);
        }
        .nav-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--blue), var(--violet));
          z-index: 200;
          transition: width 120ms ease;
          pointer-events: none;
        }
      `}</style>

      <NavProgressBar />

      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="nav-inner" aria-label="Main navigation">
          <a className="brand" href="#hero" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">~</span>
            <span className="brand-name">{brandHandle}</span>
          </a>

          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? copy.controls.closeMenuLabel : copy.controls.menuLabel}
            title={menuOpen ? copy.controls.closeMenuLabel : copy.controls.menuLabel}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            {copy.nav.map((item, index) => (
              <a
                key={item.id}
                className={activeSection === item.id ? "is-active" : ""}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-index">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="nav-controls">
            <button
              className="icon-button language-toggle"
              type="button"
              aria-label={copy.controls.languageLabel}
              title={copy.controls.languageLabel}
              onClick={() => onLanguageChange(nextLanguage)}
            >
              <Languages size={18} />
              <span>{copy.controls.language}</span>
            </button>

            <button
              className="icon-button"
              type="button"
              aria-label={copy.controls.themeLabel}
              title={copy.controls.themeLabel}
              onClick={() => onThemeChange(nextTheme)}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}

function NavProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop;
      const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setWidth(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="nav-progress-bar"
      style={{ width: `${width}%` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
