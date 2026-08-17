"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, label";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return undefined;

    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    let animId;
    let visible = false;

    const showCursor = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const handleMove = (event) => {
      showCursor();
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.transform = `translate(${target.x}px, ${target.y}px) translate(-50%, -50%)`;
    };

    const handleLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handleOver = (event) => {
      if (event.target.closest?.(INTERACTIVE_SELECTOR)) {
        ring.classList.add("is-active");
      }
    };
    const handleOut = (event) => {
      if (event.target.closest?.(INTERACTIVE_SELECTOR)) {
        ring.classList.remove("is-active");
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      ringPos.x = lerp(ringPos.x, target.x, 0.18);
      ringPos.y = lerp(ringPos.y, target.y, 0.18);
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div className="custom-cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="custom-cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
