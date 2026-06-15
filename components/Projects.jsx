import Image from "next/image";
import { ExternalLink, Github, Images, Wrench } from "lucide-react";

function ProjectPreview({ project }) {
  const firstImage = project.gallery?.[0];

  if (firstImage) {
    return (
      <div className="project-preview">
        <Image
          src={firstImage.src}
          alt={firstImage.alt}
          fill
          sizes="(max-width: 768px) 90vw, 360px"
          className="project-preview-image"
        />
      </div>
    );
  }

  return (
    <div className="project-preview project-preview-empty" aria-hidden="true">
      <Wrench size={30} />
    </div>
  );
}

export default function Projects({ copy, onOpenProject }) {
  return (
    <section className="section projects-section" id="projects">
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="projects-grid">
          {copy.list.map((project, index) => (
            <article
              className="project-card tilt-card"
              data-animate
              key={project.id}
              style={{ "--delay": `${index * 45}ms` }}
            >
              <ProjectPreview project={project} />

              <div className="project-body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>

              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
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
          ))}
        </div>
      </div>
    </section>
  );
}
