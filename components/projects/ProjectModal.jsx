"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import styles from "./ProjectModal.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectModal({ project, labels, modalCopy, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const restoreRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const hasGallery = project.gallery?.length > 0;

  /* Focus management: remember what had focus, move into the dialog, trap
     Tab inside it, and put focus back where it came from on close. */
  useEffect(() => {
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    document.body.classList.add("is-modal-open");

    return () => {
      document.body.classList.remove("is-modal-open");
      const restore = restoreRef.current;
      if (restore instanceof HTMLElement) restore.focus();
    };
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.offsetParent !== null
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          className={styles.panel}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${project.id}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          transition={spring}
        >
          <header className={styles.header}>
            <div>
              <p className={`${styles.kicker} u-mono`}>
                {hasGallery ? labels.viewGallery : labels.comingSoon}
              </p>
              <h2 className={styles.title} id={`modal-title-${project.id}`}>
                {project.title}
              </h2>
            </div>

            <button
              className={styles.close}
              type="button"
              ref={closeRef}
              aria-label={modalCopy.close}
              title={modalCopy.close}
              onClick={onClose}
            >
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.body}>
            <p className={styles.description}>{project.description}</p>

            {project.highlights?.length ? (
              <ul className={styles.highlights}>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}

            {hasGallery ? (
              <div className={styles.gallery}>
                {project.gallery.map((image, imageIndex) => (
                  <figure className={styles.frame} key={image.src}>
                    <Image
                      className={styles.image}
                      src={image.src}
                      alt={image.alt ?? `${project.title} screenshot ${imageIndex + 1}`}
                      width={1280}
                      height={800}
                      sizes="(max-width: 767px) 92vw, 780px"
                      loading={imageIndex < 2 ? "eager" : "lazy"}
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h3>{modalCopy.emptyTitle}</h3>
                <p>{modalCopy.emptyBody}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
