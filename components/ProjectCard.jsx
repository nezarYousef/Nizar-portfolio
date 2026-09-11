import { ArrowUpRight, Github } from "lucide-react";
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
      </div>
    </article>
  );
}
