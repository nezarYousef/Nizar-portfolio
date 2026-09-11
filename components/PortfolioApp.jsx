"use client";

import { useEffect, useMemo, useState } from "react";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import OtherExperience from "@/components/OtherExperience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import TimelineSection from "@/components/TimelineSection";
import { portfolioCopy } from "@/data/portfolio";
import { refreshScrollProgress } from "@/lib/scrollProgress";

const LANGUAGE_KEY = "nizar-portfolio-language";
const THEME_KEY = "nizar-portfolio-theme";

const readPreference = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writePreference = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference persistence is a progressive enhancement.
  }
};

export default function PortfolioApp() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [settingsReady, setSettingsReady] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const copy = portfolioCopy[language];
  const sectionIds = useMemo(() => copy.nav.map((item) => item.id), [copy.nav]);

  // The inline boot script in app/layout.jsx has already applied the saved
  // (or OS) theme and language to <html>; adopt them without a flash.
  useEffect(() => {
    const root = document.documentElement;
    const savedLanguage = readPreference(LANGUAGE_KEY);
    if (savedLanguage === "en" || savedLanguage === "ar") setLanguage(savedLanguage);
    setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    const root = document.documentElement;
    root.lang = copy.lang;
    root.dir = copy.dir;
    root.dataset.theme = theme;
    // Layout can shift when direction or fonts change; re-measure scroll acts.
    refreshScrollProgress();
  }, [copy.dir, copy.lang, settingsReady, theme]);

  const changeLanguage = (next) => {
    setLanguage(next);
    writePreference(LANGUAGE_KEY, next);
  };

  const changeTheme = (next) => {
    setTheme(next);
    writePreference(THEME_KEY, next);
  };

  // Active nav item: the last section whose top has passed a line near the top.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = "hero";
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      });
      setActiveSection(current);
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
  }, [sectionIds]);

  return (
    <>
      <a className="skip-link" href="#main">
        {copy.controls.skipLabel}
      </a>

      <Navigation
        activeSection={activeSection}
        copy={copy}
        language={language}
        theme={theme}
        onLanguageChange={changeLanguage}
        onThemeChange={changeTheme}
      />

      <main id="main">
        <Hero copy={copy.hero} theme={theme} dir={copy.dir} />
        <About
          copy={copy.about}
          stats={copy.hero.stats}
          imageAlt={copy.hero.imageAlt}
          language={language}
        />
        <Skills copy={copy.skills} language={language} />
        <Projects copy={copy.projects} dir={copy.dir} language={language} />
        <TimelineSection copy={copy.experience} id="experience" index="04" language={language} />
        <OtherExperience copy={copy.otherExperience} dir={copy.dir} language={language} />
        <TimelineSection copy={copy.education} id="education" index="06" language={language} />
        <Contact copy={copy.contact} language={language} />
      </main>

      <Footer text={copy.footer} />
    </>
  );
}
