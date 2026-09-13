"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Cursor.module.css";

/*
 * A circular pointer: a small filled dot that tracks exactly, and a ring that
 * follows it with a little lag. The ring is the only thing that reacts, by
 * changing size. Fine pointers only, never under reduced motion, and it never
 * intercepts a click.
 */

const INTERACTIVE = "a, button, [role='button'], summary, input, textarea, select, label[for]";

function resolveMode(element) {
  if (!element || typeof element.closest !== "function") return "default";
  const marked = element.closest("[data-cursor]");
  if (marked) return marked.dataset.cursor;
  return element.closest(INTERACTIVE) ? "action" : "default";
}

export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [mode, setMode] = useState("default");
  const [visible, setVisible] = useState(false);
  const [press, setPress] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return undefined;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pointer.x, y: pointer.y };
    let frame = 0;
    let shown = false;

    const draw = () => {
      // Critically damped enough to feel attached, loose enough to read as a trail.
      ring.x += (pointer.x - ring.x) * 0.18;
      ring.y += (pointer.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!shown) {
        shown = true;
        setVisible(true);
      }
      setMode(resolveMode(event.target));
    };

    // The element under a stationary pointer changes while the page scrolls.
    const onScroll = () => {
      if (!shown) return;
      setMode(resolveMode(document.elementFromPoint(pointer.x, pointer.y)));
    };

    const onLeave = (event) => {
      if (event.relatedTarget === null) setVisible(false);
    };
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("pointerover", onEnter);
    window.addEventListener("pointerdown", () => setPress(true), { passive: true });
    window.addEventListener("pointerup", () => setPress(false), { passive: true });
    window.addEventListener("blur", () => setVisible(false));

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerover", onEnter);
    };
  }, []);

  return (
    <>
      <span
        className={styles.ring}
        ref={ringRef}
        data-mode={mode}
        data-press={press ? "true" : undefined}
        data-visible={visible ? "true" : undefined}
        aria-hidden="true"
      >
        <i className={styles.axis} />
      </span>
      <span
        className={styles.dot}
        ref={dotRef}
        data-mode={mode}
        data-visible={visible ? "true" : undefined}
        aria-hidden="true"
      />
    </>
  );
}
