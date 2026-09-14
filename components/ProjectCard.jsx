"use client";

import { ArrowUpRight, Github, Play } from "lucide-react";
import { useState } from "react";
import DemoVideoModal from "@/components/DemoVideoModal";
import ProjectCover from "@/components/ProjectCover";
import styles from "./ProjectStack.module.css";

/* GitHub first, otherwise a live demo, otherwise nothing. Never two. */
export function projectLink(project, labels) {
  if (project.github) return { href: project.github, label: labels.viewGithub, kind: "github" };
  if (project.demo) return { href: project.demo, label: labels.viewDemo, kind: "demo" };
  return null;
}

export default function ProjectCard({ project, index, total, labels, isActive, priority }) {
  const link = projectLink(project, labels);
  const number = String(index + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <article className={styles.card} aria-labelledby={`project-${project.id}`}>
      <div className={styles.coverWrap}>
        <ProjectCover project={project} label={labels.inDevelopment} priority={priority} />
      </div>

      <div className={styles.content}>
        <p className={styles.number}>
          {number}
          <span> / {count}</span>
        </p>
        <h3 className={styles.title} id={`project-${project.id}`}>
          {project.title}
        </h3>
        {project.description ? <p className={styles.description}>{project.description}</p> : null}

        {project.tags?.length ? (
          <ul className={`tags ${styles.tags}`}>
            {project.tags.slice(0, 4).map((tag) => (
              <li className="tag" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {link ? (
          <a
            className={styles.action}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isActive ? undefined : -1}
          >
            {link.kind === "github" ? <Github size={17} aria-hidden="true" /> : null}
            <span>{link.label}</span>
            <ArrowUpRight size={16} aria-hidden="true" className={styles.actionArrow} />
          </a>
        ) : null}

        {project.soon ? <span className={styles.action}>{labels.soon ?? "Soon"}</span> : null}

        {project.demoVideo ? (
          <button
            type="button"
            className={styles.action}
            onClick={() => setDemoOpen(true)}
            tabIndex={isActive ? undefined : -1}
          >
            <Play size={16} aria-hidden="true" />
            <span>{labels.watchDemo}</span>
          </button>
        ) : null}
      </div>

      {demoOpen ? (
        <DemoVideoModal
          src={project.demoVideo}
          title={`${project.title} — ${labels.watchDemo}`}
          closeLabel={labels.closeDemo}
          onClose={() => setDemoOpen(false)}
        />
      ) : null}
    </article>
  );
}
