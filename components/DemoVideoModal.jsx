"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./DemoVideoModal.module.css";

/*
 * A small, self-contained lightbox for a single demo clip. Opened from a
 * project's "Watch demo" action, it autoplays, closes itself the moment the
 * clip ends, and otherwise behaves like any modal should: Escape, a click on
 * the backdrop, or the close button all dismiss it, and background scroll is
 * locked while it's open (the same body.is-locked hook the intro uses).
 *
 * Portaled straight to <body>: the project deck fans its cards out with CSS
 * `transform`, which turns any transformed ancestor into the containing
 * block for a `position: fixed` descendant. Rendered in place, the overlay
 * would be pinned to that small, transformed card instead of the viewport.
 */
export default function DemoVideoModal({ src, title, closeLabel, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("is-locked");
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.classList.remove("is-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={closeLabel}
          ref={closeRef}
        >
          <X size={18} aria-hidden="true" />
        </button>
        <video
          className={styles.video}
          src={src}
          controls
          autoPlay
          playsInline
          onEnded={onClose}
        />
      </div>
    </div>,
    document.body
  );
}
