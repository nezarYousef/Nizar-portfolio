"use client";

import { useEffect, useMemo, useState } from "react";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import ProjectModal from "@/components/ProjectModal";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import TimelineSection from "@/components/TimelineSection";
import { portfolioCopy } from "@/data/portfolio";

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
  const [activeProjectId, setActiveProjectId] = useState(null);

  const copy = portfolioCopy[language];
  const activeProject = copy.projects.list.find(
    (project) => project.id === activeProjectId
  );

  const sectionIds = useMemo(
    () => ["hero", ...copy.nav.map((item) => item.id)],
    [copy.nav]
  );

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    writePreference(LANGUAGE_KEY, nextLanguage);
  };

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    writePreference(THEME_KEY, nextTheme);
  };

  useEffect(() => {
    const savedLanguage = readPreference(LANGUAGE_KEY);
    const savedTheme = readPreference(THEME_KEY);

    if (savedLanguage === "en" || savedLanguage === "ar") {
      setLanguage(savedLanguage);
    }

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    setSettingsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = copy.lang;
    document.documentElement.dir = copy.dir;
    document.documentElement.dataset.theme = theme;

    if (settingsReady) {
      writePreference(LANGUAGE_KEY, language);
      writePreference(THEME_KEY, theme);
    }
  }, [copy.dir, copy.lang, language, settingsReady, theme]);

  useEffect(() => {
    const animatedElements = document.querySelectorAll("[data-animate]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    animatedElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    const updateActiveSection = () => {
      let current = "hero";

      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 150) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionIds]);

  return (
    <div className="site-shell">
      <div className="ambient-background" aria-hidden="true">
        <span className="ambient-band ambient-band-one" />
        <span className="ambient-band ambient-band-two" />
        <span className="ambient-scanline" />
      </div>

      <Navigation
        activeSection={activeSection}
        copy={copy}
        language={language}
        theme={theme}
        onLanguageChange={changeLanguage}
        onThemeChange={changeTheme}
      />

      <main>
        <Hero copy={copy.hero} />
        <About copy={copy.about} />
        <Skills copy={copy.skills} />
        <Projects
          copy={copy.projects}
          onOpenProject={(projectId) => setActiveProjectId(projectId)}
        />
        <TimelineSection
          copy={copy.experience}
          iconType="experience"
          id="experience"
        />
        <TimelineSection
          copy={copy.education}
          iconType="education"
          id="education"
        />
        <Contact copy={copy.contact} />
      </main>

      <footer className="site-footer">
        <p>&copy; {copy.footer}</p>
      </footer>

      <ProjectModal
        labels={copy.projects}
        modalCopy={copy.modal}
        project={activeProject}
        onClose={() => setActiveProjectId(null)}
      />
    </div>
  );
}
