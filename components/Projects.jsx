"use client";

import { useRef } from "react";
import FeaturedProject from "@/components/FeaturedProject";
import ProjectStack from "@/components/ProjectStack";
import SectionHeading from "@/components/SectionHeading";
import { useReveal } from "@/lib/useReveal";
import styles from "./Projects.module.css";

/*
 * Hierarchy: one flagship, then the rest of the work as a deck you step
 * through. No grid, and nothing here is the same size as anything else.
 */
export default function Projects({ copy, dir, language }) {
  const sectionRef = useRef(null);
  useReveal(sectionRef, [language]);

  const [featured, ...rest] = copy.list;

  return (
    <section className="section screen" id="projects" ref={sectionRef} aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading index="03" eyebrow={copy.eyebrow} title={copy.title} id="projects-title" />

        <FeaturedProject project={featured} labels={copy} />

        <div className={styles.more}>
          <p className="kicker" data-reveal="">
            <span>{copy.moreLabel}</span>
          </p>
          <ProjectStack projects={rest} labels={copy} dir={dir} offset={1} />
        </div>
      </div>
    </section>
  );
}
