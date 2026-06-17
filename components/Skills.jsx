"use client";

import { useState } from "react";
import {
  Code2, Globe, BrainCircuit, Eye, Layers, Wrench,
  ChevronRight, Zap, Star
} from "lucide-react";

const CATEGORY_ICONS = {
  0: Code2,
  1: Globe,
  2: BrainCircuit,
  3: Eye,
  4: Layers,
  5: Wrench
};

const CATEGORY_COLORS = [
  { accent: "#0ea5a4", soft: "rgba(14,165,164,0.12)", dark: "#28d7c4" },
  { accent: "#3d73d9", soft: "rgba(61,115,217,0.12)", dark: "#75a7ff" },
  { accent: "#9a5bbd", soft: "rgba(154,91,189,0.12)", dark: "#d98bd4" },
  { accent: "#548f45", soft: "rgba(84,143,69,0.12)", dark: "#b4d455" },
  { accent: "#c8556a", soft: "rgba(200,85,106,0.12)", dark: "#ff8aa1" },
  { accent: "#12977f", soft: "rgba(18,151,127,0.12)", dark: "#34d399" }
];

function SkillCard({ category, index }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const Icon = CATEGORY_ICONS[index] ?? Code2;
  const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

  const skillLevels = category.items.map((item, i) => ({
    name: item,
    level: 70 + Math.floor((index * 7 + i * 13) % 28)
  }));

  return (
    <div
      className="skill-card-3d-wrap"
      style={{
        perspective: "900px",
        animationDelay: `${index * 60}ms`
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      <div
        className={`skill-card-3d-inner ${flipped ? "is-flipped" : ""}`}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          height: "220px"
        }}
      >
        {/* FRONT */}
        <div
          className="skill-card tilt-card"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            position: "absolute",
            inset: 0,
            cursor: "pointer"
          }}
          onClick={() => setFlipped(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setFlipped(true)}
          aria-label={`${category.title} — click for skill levels`}
        >
          <div
            className="skill-card-icon"
            style={{
              background: colors.soft,
              borderColor: `color-mix(in srgb, ${colors.accent} 52%, var(--line))`
            }}
          >
            <Icon size={20} style={{ color: colors.accent }} />
          </div>
          <h3>{category.title}</h3>
          <div className="skill-tags">
            {category.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="skill-card-hint">
            <ChevronRight size={14} />
            <span>View levels</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="skill-card skill-card-back"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setFlipped(false)}
          role="button"
          tabIndex={flipped ? 0 : -1}
          aria-label="Back to skill list"
        >
          <h3 style={{ marginBottom: "16px", fontSize: "0.95rem" }}>{category.title}</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {skillLevels.map(({ name, level }) => (
              <div key={name} style={{ display: "grid", gap: "4px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.76rem",
                  fontFamily: "var(--mono)",
                  color: "var(--text-muted)"
                }}>
                  <span>{name}</span>
                  <span style={{ color: colors.accent }}>{level}%</span>
                </div>
                <div style={{
                  height: "4px",
                  borderRadius: "999px",
                  background: "var(--surface-soft)",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${level}%`,
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, ${colors.accent}, ${colors.dark})`,
                    animation: flipped ? "skillBarGrow 0.8s ease forwards" : "none",
                    transformOrigin: "left"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skills({ copy }) {
  return (
    <section className="section skills-section" id="skills">
      <style>{`
        @keyframes skillBarGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .skill-card-back::before {
          background: linear-gradient(90deg, var(--accent), var(--blue), var(--violet)) !important;
        }
        .skill-card-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: auto;
          padding-top: 14px;
          color: var(--accent);
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 850;
          opacity: 0.7;
        }
        .skill-card-3d-wrap {
          display: flex;
          flex-direction: column;
        }
        .skills-grid-3d {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        @media (max-width: 1120px) {
          .skills-grid-3d { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 680px) {
          .skills-grid-3d { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="skills-grid-3d">
          {copy.categories.map((category, index) => (
            <div key={category.title} data-animate style={{ "--delay": `${index * 60}ms` }}>
              <SkillCard category={category} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
