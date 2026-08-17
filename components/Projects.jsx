"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Github, Images, Wrench, Code2, Cpu } from "lucide-react";
import BlurImage from "@/components/BlurImage";

const TAG_COLORS = {
  "React.js": { bg: "rgba(97,218,251,0.12)", color: "#1a9dc8", border: "rgba(97,218,251,0.3)" },
  "Next.js": { bg: "rgba(0,0,0,0.08)", color: "var(--heading)", border: "rgba(0,0,0,0.15)" },
  "Python": { bg: "rgba(55,118,171,0.12)", color: "#3776ab", border: "rgba(55,118,171,0.3)" },
  "Java": { bg: "rgba(237,117,28,0.12)", color: "#ed751c", border: "rgba(237,117,28,0.3)" },
  "C": { bg: "rgba(90,90,200,0.12)", color: "#5a5ac8", border: "rgba(90,90,200,0.3)" },
  "Machine Learning": { bg: "rgba(154,91,189,0.12)", color: "#9a5bbd", border: "rgba(154,91,189,0.3)" },
  "AI": { bg: "rgba(14,165,164,0.12)", color: "var(--accent)", border: "rgba(14,165,164,0.3)" },
  "CNN": { bg: "rgba(61,115,217,0.12)", color: "#3d73d9", border: "rgba(61,115,217,0.3)" },
  "Computer Vision": { bg: "rgba(84,143,69,0.12)", color: "#548f45", border: "rgba(84,143,69,0.3)" }
};

const DEFAULT_TAG_COLORS = {
  bg: "var(--surface-soft)",
  color: "var(--text)",
  border: "var(--line)"
};

function ProjectPreview({ project }) {
  const firstImage = project.gallery?.[0];
  const previewImage = project.previewImage ?? firstImage?.src;
  const previewAlt = project.previewImage
    ? `${project.title} project preview`
    : firstImage?.alt;

  if (previewImage) {
    return (
      <div className="project-preview">
        <BlurImage
          src={previewImage}
          alt={previewAlt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className={`project-preview-image${
            project.previewFit === "contain" ? " project-preview-image-contain" : ""
          }`}
        />
        <div className="project-preview-overlay">
          <Images size={22} />
          <span>{project.gallery?.length ?? 0} screenshots</span>
        </div>
      </div>
    );
  }
  return (
    <div className="project-preview project-preview-empty" aria-hidden="true">
      <div className="project-preview-empty-inner">
        <Cpu size={28} />
        <span>In Development</span>
      </div>
    </div>
  );
}

const FILTER_KEYWORDS = {
  ai: ["AI", "Machine Learning", "Computer Vision", "LLM", "Chatbot", "CNN"],
  web: [
    "React.js", "Next.js", "JavaScript", "HTML/CSS", "API", "FastAPI",
    "UI Systems", "UI Engineering", "State Management", "Productivity"
  ],
  systems: ["C", "Java", "OOP", "Linux/UNIX", "OS", "Systems", "Desktop App"]
};

const FILTER_LABELS = {
  en: { all: "All", web: "Web", ai: "AI", systems: "Systems" },
  ar: { all: "الكل", web: "ويب", ai: "ذكاء اصطناعي", systems: "أنظمة" }
};

function matchesFilter(tags, filter) {
  if (filter === "all") return true;
  const keywords = FILTER_KEYWORDS[filter] ?? [];
  return tags.some((tag) => keywords.includes(tag));
}

export default function Projects({ copy, language = "en", onOpenProject }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const labels = FILTER_LABELS[language] ?? FILTER_LABELS.en;
  const visibleProjects = copy.list.filter((project) => matchesFilter(project.tags, activeFilter));

  // Filtered cards re-mount on every switch, so each switch needs its own
  // observer — the page-level one only ever sees the nodes present at load.
  useEffect(() => {
    const nodes = document.querySelectorAll(".projects-grid [data-animate]");
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
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [activeFilter]);

  return (
    <section className="section projects-section" id="projects">
      <style>{`
        .projects-filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0 0 28px;
        }
        .projects-filter-tabs button {
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: 7px 14px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: var(--surface);
          color: var(--text-muted);
          font-family: var(--mono);
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
        }
        .projects-filter-tabs button:hover {
          color: var(--heading);
          border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
          transform: translateY(-2px);
        }
        .projects-filter-tabs button.is-active {
          border-color: color-mix(in srgb, var(--accent) 70%, transparent);
          background: var(--accent);
          color: #071413;
        }
        @keyframes projectsGridIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .projects-grid { animation: projectsGridIn 380ms ease both; }
        .project-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(14, 165, 164, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          font-family: var(--mono);
          font-size: 0.82rem;
          font-weight: 850;
          opacity: 0;
          transition: opacity 280ms ease, background 280ms ease;
          flex-direction: column;
        }
        .project-card:hover .project-preview-overlay {
          opacity: 1;
          background: rgba(14, 165, 164, 0.42);
        }
        .project-preview-empty-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          opacity: 0.5;
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 850;
        }
        .project-tag-colored {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 9px;
          border-radius: var(--radius-sm);
          font-family: var(--mono);
          font-size: 0.73rem;
          font-weight: 780;
          line-height: 1.15;
          text-align: center;
          transition: transform 150ms ease;
        }
        .project-tag-colored:hover { transform: translateY(-2px); }
        .project-card-3d-wrap {
          perspective: 1000px;
        }
        .project-card {
          transition: transform 280ms cubic-bezier(0.4,0,0.2,1), border-color 280ms ease, box-shadow 280ms ease;
        }
      `}</style>
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="projects-filter-tabs" role="tablist" aria-label="Filter projects by category">
          {["all", "web", "ai", "systems"].map((filter) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={activeFilter === filter}
              className={activeFilter === filter ? "is-active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {labels[filter]}
            </button>
          ))}
        </div>

        <div className="projects-grid" key={activeFilter}>
          {visibleProjects.map((project, index) => (
            <div
              key={project.id}
              className="project-card-3d-wrap"
              data-animate
              style={{ "--delay": `${index * 45}ms` }}
            >
              <article className="project-card tilt-card">
                <ProjectPreview project={project} />

                <div className="project-body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>

                <div className="project-tags">
                  {project.tags.map((tag) => {
                    const colors = TAG_COLORS[tag] ?? DEFAULT_TAG_COLORS;
                    return (
                      <span
                        key={tag}
                        className="project-tag-colored"
                        style={{
                          background: colors.bg,
                          color: colors.color,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>

                <div className="project-actions">
                  {project.gallery?.length > 0 ? (
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`${copy.viewGallery}: ${project.title}`}
                      title={copy.viewGallery}
                      onClick={() => onOpenProject(project.id)}
                    >
                      <Images size={18} />
                    </button>
                  ) : null}

                  {project.github ? (
                    <a
                      className="icon-button"
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${copy.viewGithub}: ${project.title}`}
                      title={copy.viewGithub}
                    >
                      <Github size={18} />
                      <ExternalLink size={13} className="external-indicator" />
                    </a>
                  ) : null}

                  {!project.github && !project.gallery?.length ? (
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`${copy.comingSoon}: ${project.title}`}
                      title={copy.comingSoon}
                      onClick={() => onOpenProject(project.id)}
                    >
                      <Wrench size={18} />
                    </button>
                  ) : null}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
