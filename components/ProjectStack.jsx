"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { useScrollProgress } from "@/lib/scrollProgress";
import { usePrefersReducedMotion } from "@/lib/useMedia";
import styles from "./ProjectStack.module.css";

const SWIPE_THRESHOLD = 48;

/* Where a card sits in the deck, relative to the active one. */
function poseFor(offset, total) {
  if (offset === 0) return "0";
  if (offset === total - 1) return "out"; // the card we just dealt away
  if (offset <= 3) return String(offset);
  return "back";
}

export default function ProjectStack({ projects, labels, dir, offset = 0 }) {
  const [active, setActive] = useState(0);
  const deckRef = useRef(null);
  const pointer = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const total = projects.length;
  // Numbering continues from the flagship, so the deck reads 02..09 of 09.
  const shown = total + offset;

  // The fanned deck closes into a neat stack as the section arrives.
  useScrollProgress(deckRef, { mode: "enter", span: 0.8, disabled: reducedMotion, resetTo: 1 });

  const go = useCallback(
    (step) => setActive((current) => (current + step + total) % total),
    [total]
  );

  const rtl = dir === "rtl";
  const prev = () => go(-1);
  const next = () => go(1);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(rtl ? -1 : 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(rtl ? 1 : -1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(total - 1);
    }
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    // Swipe left = next (mirrored in RTL).
    go((dx < 0) !== rtl ? 1 : -1);
  };

  const activeProject = projects[active];
  const status = labels.position
    .replace("{n}", String(active + 1 + offset))
    .replace("{total}", String(shown));

  return (
    <div
      className={styles.stack}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.deckLabel}
      onKeyDown={onKeyDown}
    >
      <div
        ref={deckRef}
        className={styles.deck}
        data-cursor="swipe"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointer.current = null)}
      >
        {projects.map((project, index) => {
          const offset = (index - active + total) % total;
          const pose = poseFor(offset, total);
          const isActive = offset === 0;
          return (
            <div
              key={project.id}
              className={styles.slot}
              data-pose={pose}
              style={{ "--k": Math.min(offset, 3) }}
              aria-hidden={isActive ? undefined : true}
              inert={isActive ? undefined : true}
            >
              <div className={styles.slotInner}>
                <ProjectCard
                  project={project}
                  index={index + offset}
                  total={shown}
                  labels={labels}
                  isActive={isActive}
                  priority={index === 0}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <div className={styles.segments} role="group" aria-label={labels.deckLabel}>
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              className={styles.segment}
              aria-current={index === active ? "true" : undefined}
              aria-label={`${String(index + 1 + offset).padStart(2, "0")} ${project.title}`}
              title={project.title}
              onClick={() => setActive(index)}
            />
          ))}
        </div>

        <div className={styles.arrows}>
          <button className="icon-btn" type="button" onClick={prev} aria-label={labels.previous} title={labels.previous}>
            {rtl ? <ArrowRight size={19} aria-hidden="true" /> : <ArrowLeft size={19} aria-hidden="true" />}
          </button>
          <span className={styles.counter} aria-hidden="true">
            {String(active + 1 + offset).padStart(2, "0")}
            <span> / {String(shown).padStart(2, "0")}</span>
          </span>
          <button className="icon-btn" type="button" onClick={next} aria-label={labels.next} title={labels.next}>
            {rtl ? <ArrowLeft size={19} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`${status}: ${activeProject.title}`}
      </p>
    </div>
  );
}
