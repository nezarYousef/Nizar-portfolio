"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import styles from "./SkillCard.module.css";

/* One compact category card that flips in 3D to its evidence side.

   Progressive enhancement: the server HTML renders both faces stacked in
   plain flow - fully readable with JavaScript disabled. Only after hydration
   (data-ready) do the faces become absolutely positioned inside a measured
   container, and the flip interaction activates. The flip is click/tap only,
   never hover; both faces hold real <button>s so keyboard Enter/Space works
   unchanged, and visibility (not just backface) keeps the hidden face out of
   the tab order and the accessibility tree.

   Height: the container is sized to the active face's measured height and
   animates between the two, so the front stays compact while the back may
   run taller. Re-measured on resize and after fonts load. Under reduced
   motion every transition collapses to an instant swap. */
export default function SkillCard({
  index,
  title,
  items,
  projectTitles,
  labels,
  programLabels
}) {
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const backId = useId();

  const measure = useCallback(() => {
    const face = flipped ? backRef.current : frontRef.current;
    if (face) setHeight(face.getBoundingClientRect().height);
  }, [flipped]);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    measure();
    /* A late font swap changes text metrics; re-measure once it settles. */
    document.fonts?.ready.then(measure).catch(() => {});
  }, [ready, measure]);

  useEffect(() => {
    if (!ready) return undefined;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [ready, measure]);

  const preview = items.slice(0, 3);
  const rest = items.length - preview.length;

  return (
    <div
      className={styles.flip}
      data-ready={ready ? "true" : "false"}
      data-flipped={flipped ? "true" : "false"}
      style={ready && height ? { "--card-h": `${Math.round(height)}px` } : undefined}
    >
      <div className={styles.flipInner}>
        <div className={`${styles.face} ${styles.faceFront}`} ref={frontRef}>
          <h3 className={styles.categoryTitle}>
            <span className={`${styles.categoryIndex} u-mono`}>{index}</span>
            {title}
          </h3>

          <ul className={styles.preview}>
            {preview.map((item) => (
              <li className={`${styles.previewChip} u-mono`} key={item.key}>
                {item.name}
              </li>
            ))}
            {rest > 0 ? (
              <li className={`${styles.previewMore} u-mono`}>+{rest}</li>
            ) : null}
          </ul>

          <button
            type="button"
            className={styles.flipButton}
            aria-expanded={flipped}
            aria-controls={backId}
            onClick={() => setFlipped(true)}
          >
            <span>{labels.details}</span>
            <ChevronRight size={15} aria-hidden="true" className={styles.chevronLtr} />
            <ChevronLeft size={15} aria-hidden="true" className={styles.chevronRtl} />
          </button>
        </div>

        <div
          className={`${styles.face} ${styles.faceBack}`}
          ref={backRef}
          id={backId}
          aria-hidden={!flipped}
        >
          <ul className={styles.skillList}>
            {items.map((item) => {
              const projects = item.projects
                .map((id) => projectTitles[id])
                .filter(Boolean);
              const programs = item.programs
                .map((key) => programLabels[key])
                .filter(Boolean);

              return (
                <li className={styles.skill} key={item.key}>
                  <p className={styles.skillName}>{item.name}</p>
                  {projects.length || programs.length ? (
                    <dl className={styles.evidence}>
                      {projects.length ? (
                        <div className={styles.evidenceRow}>
                          <dt className={`${styles.evidenceLabel} u-mono`}>
                            {labels.usedIn}
                          </dt>
                          <dd className={styles.evidenceValue}>
                            {projects.map((title) => (
                              <a
                                className={styles.evidenceLink}
                                href="#projects"
                                key={title}
                              >
                                {title}
                              </a>
                            ))}
                          </dd>
                        </div>
                      ) : null}
                      {programs.length ? (
                        <div className={styles.evidenceRow}>
                          <dt className={`${styles.evidenceLabel} u-mono`}>
                            {labels.studiedIn}
                          </dt>
                          <dd className={styles.evidenceValue}>
                            {programs.map((title) => (
                              <span
                                className={styles.evidenceProgram}
                                key={title}
                              >
                                {title}
                              </span>
                            ))}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className={styles.flipButton}
            onClick={() => setFlipped(false)}
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>{labels.back}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
