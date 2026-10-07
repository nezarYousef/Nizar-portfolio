"use client";

import { ArrowUpRight, Github, Play } from "lucide-react";
import { useState } from "react";
import DemoVideoModal from "@/components/DemoVideoModal";
import ProjectCover from "@/components/ProjectCover";
import styles from "./ProjectStack.module.css";

export function projectLinks(project, labels) {
  const links = [];
  if (project.demo) links.push({ href: project.demo, label: labels.viewDemo, kind: "demo" });
  if (project.github) links.push({ href: project.github, label: labels.viewGithub, kind: "github" });
  return links;
}

export default function ProjectCard({ project, index, total, labels, isActive, priority }) {
  const links = projectLinks(project, labels);
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

        {links.length ? (
          <div className={styles.actions}>
            {links.map((link) => (
              <a
                key={link.kind}
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
            ))}
          </div>
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
