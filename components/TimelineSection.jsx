"use client";

import { BriefcaseBusiness, GraduationCap, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function AnimatedTimelineLine() {
  const lineRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let start = null;
            const duration = 1400;
            const animate = (timestamp) => {
              if (!start) start = timestamp;
              const elapsed = timestamp - start;
              const p = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - p, 3);
              setProgress(ease * 100);
              if (p < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            observer.unobserve(line);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(line);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={lineRef}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        insetInlineStart: "20px",
        width: "2px",
        background: "var(--line)",
        overflow: "hidden"
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${progress}%`,
          background: "linear-gradient(180deg, var(--accent), var(--blue), var(--violet))",
          transition: "height 0.1s linear",
          borderRadius: "999px"
        }}
      />
    </div>
  );
}

function TimelineCard({ item, index, Icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="timeline-item"
      data-animate
      style={{
        "--delay": `${index * 80}ms`,
        transition: "transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease",
        transform: hovered ? "translateY(-4px) translateX(4px)" : "translateY(0) translateX(0)",
        boxShadow: hovered ? "var(--shadow-3d)" : "var(--shadow-soft)",
        borderColor: hovered
          ? "color-mix(in srgb, var(--accent) 52%, var(--line))"
          : "var(--line)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="timeline-icon"
        style={{
          background: hovered
            ? "linear-gradient(135deg, var(--accent-soft), var(--surface-strong))"
            : "var(--surface-strong)",
          transition: "background 250ms ease, color 250ms ease, border-color 250ms ease",
          borderColor: hovered
            ? "color-mix(in srgb, var(--accent) 70%, var(--line))"
            : "color-mix(in srgb, var(--accent) 52%, var(--line))"
        }}
      >
        <Icon size={20} />
      </div>

      <div className="timeline-content">
        <div className="timeline-topline">
          <h3>{item.title}</h3>
          <span>{item.date}</span>
        </div>
        <p className="timeline-company" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <MapPin size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
          {item.company}
        </p>
        <ul>
          {item.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function TimelineSection({ copy, iconType, id }) {
  const Icon = iconType === "experience" ? BriefcaseBusiness : GraduationCap;

  return (
    <section className={`section timeline-section ${id}-section`} id={id}>
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="timeline" style={{ position: "relative" }}>
          <AnimatedTimelineLine />
          {copy.items.map((item, index) => (
            <TimelineCard key={`${item.title}-${item.date}`} item={item} index={index} Icon={Icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
