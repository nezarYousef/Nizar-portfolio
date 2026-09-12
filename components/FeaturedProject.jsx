"use client";

import { ArrowUpRight, Github } from "lucide-react";
import { useRef } from "react";
import ProjectCover from "@/components/ProjectCover";
import { projectLink } from "@/components/ProjectCard";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./FeaturedProject.module.css";

/*
 * The flagship. One project gets the large visual and the full stack listed,
 * so the section opens with depth instead of nine equal thumbnails. Everything
 * after it lives in the deck below.
 */
export default function FeaturedProject({ project, labels }) {
  const frameRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const link = projectLink(project, labels);

  // The cover drifts a little inside its frame: depth, not parallax theatre.
  useScrollProgress(frameRef, { mode: "through", disabled: reducedMotion, resetTo: 0.5 });

  return (
    <article className={styles.featured} data-reveal="" aria-labelledby="project-featured">
      <div className={styles.frame} ref={frameRef} data-cursor="default">
        <div className={styles.cover}>
          <ProjectCover project={project} label={labels.inDevelopment} priority />
        </div>
      </div>

      <div className={styles.body}>
        <p className="kicker">
          <b>01</b>
          <span>{labels.featuredLabel}</span>
        </p>

        <h3 className={styles.title} id="project-featured">
          {project.title}
        </h3>

        {project.description ? <p className={styles.description}>{project.description}</p> : null}

        {project.tags?.length ? (
          <ul className="tags">
            {project.tags.map((tag) => (
              <li className="tag" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {link ? (
          <a className={styles.action} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.kind === "github" ? <Github size={17} aria-hidden="true" /> : null}
            <span>{link.label}</span>
            <ArrowUpRight size={16} aria-hidden="true" className={styles.arrow} />
          </a>
        ) : null}
      </div>
    </article>
  );
}
