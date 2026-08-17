"use client";

import { BriefcaseBusiness, GraduationCap, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* Note: the reveal-on-scroll transform (data-animate) lives on the outer
   wrapper, not on .timeline-item itself, so it never fights with the card's
   own :hover transform - the two need to be able to apply independently. */

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
      className="timeline-track-line"
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
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <div
      className="timeline-item-wrap"
      data-animate
      data-side={side}
      style={{ "--delay": `${index * 80}ms` }}
    >
      <article className="timeline-item timeline-item-hoverable">
        <div className="timeline-icon">
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
    </div>
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

        <div className="timeline timeline--alternating" style={{ position: "relative" }}>
          <AnimatedTimelineLine />
          {copy.items.map((item, index) => (
            <TimelineCard key={`${item.title}-${item.date}`} item={item} index={index} Icon={Icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
