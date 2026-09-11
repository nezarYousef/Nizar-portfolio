import { BrainCircuit, GraduationCap, SquareTerminal } from "lucide-react";
import BlurImage from "@/components/BlurImage";
import styles from "./ProjectCover.module.css";

function placeholderIcon(tags = []) {
  if (tags.includes("C") || tags.includes("Linux/UNIX")) return SquareTerminal;
  if (tags.includes("Java")) return GraduationCap;
  return BrainCircuit;
}

/* One cover per project. Projects without a published image get a quiet,
   typographic cover in the site's blueprint style (v1 showed "In Development"). */
export default function ProjectCover({ project, label, priority = false }) {
  if (project.cover) {
    return (
      <div className={styles.cover}>
        <BlurImage
          src={project.cover}
          alt={`${project.title} cover`}
          fill
          sizes="(max-width: 900px) 92vw, 680px"
          priority={priority}
          className={styles.image}
          style={{ objectPosition: project.coverPosition ?? "center" }}
        />
      </div>
    );
  }

  const Icon = placeholderIcon(project.tags);
  return (
    <div className={`${styles.cover} ${styles.placeholder}`} aria-hidden="true">
      <span className={styles.status}>{label}</span>
      <Icon className={styles.icon} size={56} strokeWidth={1.4} />
    </div>
  );
}
