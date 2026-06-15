"use client";

import { Languages, Menu, Moon, Sun, X } from "lucide-react";
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

  useEffect(() => {
    const closeOnLargeScreen = () => {
      if (window.innerWidth > 860) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnLargeScreen);
    return () => window.removeEventListener("resize", closeOnLargeScreen);
  }, []);

  const nextLanguage = language === "en" ? "ar" : "en";
  const nextTheme = theme === "dark" ? "light" : "dark";
  const brandHandle = "~/nizar_";

  return (
    <header className="site-header">
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
          onClick={() => setMenuOpen((value) => !value)}
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
  );
}
