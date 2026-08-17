import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import OtherExperience from "@/components/OtherExperience";
import Projects from "@/components/Projects";
import SectionRail from "@/components/SectionRail";
import SiteHeader from "@/components/SiteHeader";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import { portfolioCopy } from "@/data/portfolio";
import { LOCALES } from "@/lib/site";
import styles from "./Site.module.css";

/* Server component. Everything below renders to static HTML; the only client
   boundaries are the header controls, the scroll-reveal wrapper, the gallery
   modal, the phone reveal and the decorative hero canvas. */
export default function Site({ lang }) {
  const copy = portfolioCopy[lang];
  const otherLang = lang === "en" ? "ar" : "en";
  const sectionIds = ["hero", ...copy.nav.map((item) => item.id)];

  return (
    <>
      <a className="u-skip-link" href="#main">
        {copy.ui.skipToContent}
      </a>

      <SiteHeader
        copy={copy}
        ui={copy.ui}
        sectionIds={sectionIds}
        otherLangHref={LOCALES[otherLang].path}
      />

      <SectionRail sections={copy.nav} />

      <main id="main">
        <Hero copy={copy.hero} ui={copy.ui} />
        <About copy={copy.about} portraitAlt={copy.hero.imageAlt} index="01" />
        <Skills copy={copy.skills} projects={copy.projects.list} index="02" />
        <Projects
          copy={{ ...copy.projects, modalCopy: copy.modal }}
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
        <Contact copy={copy.contact} index="07" />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className="u-mono">&copy; {copy.footer}</p>
        </div>
      </footer>
    </>
  );
}
