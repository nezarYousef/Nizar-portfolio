"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import About from "@/components/About";
import AmbientCode from "@/components/AmbientCode";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import Education from "@/components/Education";
import ExperienceRoad from "@/components/ExperienceRoad";
import OtherExperience from "@/components/OtherExperience";
import Preloader from "@/components/Preloader";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import { portfolioCopy } from "@/data/portfolio";
import { refreshScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";

const LANGUAGE_KEY = "nizar-portfolio-language";
const THEME_KEY = "nizar-portfolio-theme";
const INTRO_KEY = "nizar-portfolio-intro";

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
  const [intro, setIntro] = useState(false);
  const [scene3d, setScene3d] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

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

    // Whether the intro plays was already decided before first paint by the
    // boot script in app/layout.jsx, which also put the cover on screen.
    if (root.dataset.intro === "1") {
      setIntro(true);
      window.scrollTo(0, 0);
    } else {
      setScene3d(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", intro);
    return () => document.body.classList.remove("is-locked");
  }, [intro]);

  const revealScene = useCallback(() => setScene3d(true), []);

  const endIntro = useCallback(() => {
    setIntro(false);
    const root = document.documentElement;
    root.dataset.intro = "0";
    root.classList.remove("is-booting");
    try {
      window.sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Non-fatal: the intro simply plays again next time.
    }
    refreshScrollProgress();
    document.querySelector("header a")?.focus({ preventScroll: true });
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
      <AmbientCode theme={theme} enabled={!reducedMotion && scene3d} />
      <Cursor />

      {intro ? (
        <Preloader copy={copy.intro} onDone={endIntro} onReveal={revealScene} />
      ) : null}

      <a className="skip-link" href="#main">
        {copy.controls.skipLabel}
      </a>

      <div className="app" inert={intro ? true : undefined}>
        <Navigation
          activeSection={activeSection}
          copy={copy}
          language={language}
          theme={theme}
          onLanguageChange={changeLanguage}
          onThemeChange={changeTheme}
        />

        <main id="main">
          <Hero copy={copy.hero} theme={theme} dir={copy.dir} enable3d={scene3d} />
          <About
            copy={copy.about}
            stats={copy.hero.stats}
            imageAlt={copy.hero.imageAlt}
            language={language}
          />
          <Skills copy={copy.skills} language={language} />
          <Projects copy={copy.projects} dir={copy.dir} language={language} />
          <ExperienceRoad copy={copy.experience} language={language} />
          <OtherExperience copy={copy.otherExperience} dir={copy.dir} language={language} />
          <Education copy={copy.education} language={language} />
          <Contact copy={copy.contact} language={language} />
        </main>

        <Footer text={copy.footer} />
      </div>
    </>
  );
}
