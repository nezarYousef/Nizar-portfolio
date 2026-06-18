"use client";

import Image from "next/image";
import { Wrench, X } from "lucide-react";
import { useEffect } from "react";

export default function ProjectModal({ labels, modalCopy, onClose, project }) {
  useEffect(() => {
    if (!project) {
      return undefined;
    }

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("modal-open");
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [onClose, project]);

  if (!project) {
    return null;
  }

  const hasGallery = project.gallery?.length > 0;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-panel">
        <div className="modal-header">
          <div>
            <p className="section-kicker">{hasGallery ? labels.viewGallery : labels.comingSoon}</p>
            <h2 id={`modal-title-${project.id}`}>{project.title}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label={modalCopy.close}
            title={modalCopy.close}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {hasGallery ? (
          <>
            <div className="modal-project-summary">
              <p>{project.description}</p>
              {project.highlights?.length > 0 ? (
                <ul className="modal-project-highlights">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="gallery-grid">
              {project.gallery.map((image, index) => (
                <figure className="gallery-frame" key={image.src}>
                  <Image
                    src={image.src}
                    alt={image.alt ?? `${project.title} screenshot ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 92vw, 820px"
                    className="gallery-image"
                  />
                </figure>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-gallery">
            <Wrench size={34} />
            <h3>{modalCopy.emptyTitle}</h3>
            <p>{modalCopy.emptyBody}</p>
          </div>
        )}
      </div>
    </div>
  );
}
