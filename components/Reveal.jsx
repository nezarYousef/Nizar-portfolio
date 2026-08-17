"use client";

import { useEffect, useRef } from "react";
import styles from "./Reveal.module.css";

/* Staggered scroll reveal. Deliberately not Framer Motion: this runs on every
   section of the page, and one IntersectionObserver plus a CSS transition on
   transform/opacity costs nothing to ship and nothing to run. Reduced motion
   is handled in the stylesheet, where the transition simply does not exist. */
export default function Reveal({
  as: Tag = "div",
  children,
  delay = 0,
  className = "",
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className}`.trim()}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
