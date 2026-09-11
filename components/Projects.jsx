"use client";

import ProjectStack from "@/components/ProjectStack";
import SectionHeading from "@/components/SectionHeading";
import { useReveal } from "@/lib/useReveal";
import { useRef } from "react";

export default function Projects({ copy, dir, language }) {
  const sectionRef = useRef(null);
  useReveal(sectionRef, [language]);

  return (
    <section className="section" id="projects" ref={sectionRef} aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading index="03" eyebrow={copy.eyebrow} title={copy.title} id="projects-title" />
        <ProjectStack projects={copy.list} labels={copy} dir={dir} />
      </div>
    </section>
  );
}
