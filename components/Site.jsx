import About from "@/components/About";
import AssistantDock from "@/components/assistant/AssistantDock";
import Contact from "@/components/Contact";
import CustomCursor from "@/components/cursor/Cursor";
import Hero from "@/components/Hero";
import OtherExperience from "@/components/OtherExperience";
import Projects from "@/components/Projects";
import RevealController from "@/components/RevealController";
import SectionRail from "@/components/SectionRail";
import SiteHeader from "@/components/SiteHeader";
import Skills from "@/components/Skills";
import Starfield from "@/components/ambient/Starfield";
import Timeline from "@/components/Timeline";
import IntroGate from "@/components/intro/IntroGate";
import { portfolioCopy, cvConfig } from "@/data/portfolio";
import { featuredProjects, archiveProjects } from "@/data/projects";
import { LOCALES } from "@/lib/site";
import styles from "./Site.module.css";

/* The words the intro explosion scatters through space are the real skill
   names - the curated core stack first, then anything unique from the
   categories. Nothing is invented for the effect. */
function skillWordsFor(copy) {
  const words = [];
  const seen = new Set();
  const push = (name) => {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      words.push(name);
    }
  };
  copy.skills.coreStack.forEach(push);
  copy.skills.categories.forEach((category) =>
    category.items.forEach((item) => push(item.name))
  );
  return words;
}

/* Server component. Everything below renders to static HTML; the only client
   boundaries are the header controls, the scroll-reveal wrapper, the gallery
   modal, the phone reveal and the decorative hero canvas. */
export default function Site({ lang }) {
  const copy = portfolioCopy[lang];
  const otherLang = lang === "en" ? "ar" : "en";
  const sectionIds = ["hero", ...copy.nav.map((item) => item.id)];
  const skillWords = skillWordsFor(copy);

  return (
    <>
      <a className="u-skip-link" href="#main">
        {copy.ui.skipToContent}
      </a>

      {/* One continuous world behind every section: drifting dust on the
          canvas, slow atmosphere glows above it, content above both. The same
          environment underlies the whole page instead of per-section backdrops. */}
      <Starfield />
      <div className={styles.world} aria-hidden="true" />

      <CustomCursor />

      <IntroGate words={skillWords} dir={copy.dir} skipLabel={copy.ui.skipIntro} />

      <SiteHeader
        copy={copy}
        ui={copy.ui}
        sectionIds={sectionIds}
        otherLangHref={LOCALES[otherLang].path}
      />

      <SectionRail sections={copy.nav} />
      <RevealController />

      <main id="main" tabIndex={-1}>
        <Hero
          copy={copy.hero}
          ui={copy.ui}
          skillWords={skillWords}
          cvPath={cvConfig.path}
        />
        <About copy={copy.about} portraitAlt={copy.hero.imageAlt} index="01" />
        <Skills copy={copy.skills} projects={featuredProjects} index="02" />
        <Projects
          copy={{ ...copy.projects, modalCopy: copy.modal }}
          projects={featuredProjects}
          archive={archiveProjects}
          index="03"
        />
        <Timeline
          copy={copy.experience}
          id="experience"
          variant="experience"
          index="04"
        />
        <OtherExperience copy={copy.otherExperience} index="05" />
        <Timeline
          copy={copy.education}
          id="education"
          variant="education"
          index="06"
        />
        <Contact copy={copy.contact} cvPath={cvConfig.path} index="07" />
      </main>

      <footer className={styles.footer} id="site-footer">
        <div className={styles.footerInner}>
          <p className="u-mono">&copy; {copy.footer}</p>
        </div>
      </footer>

      <AssistantDock
        nav={copy.nav}
        status={copy.hero.status}
        email={{ label: copy.contact.emailLabel, href: copy.contact.links.email }}
        controls={{
          open: copy.controls.menuLabel,
          close: copy.controls.closeMenuLabel
        }}
      />
    </>
  );
}
