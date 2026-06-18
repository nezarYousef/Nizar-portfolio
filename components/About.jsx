"use client";

import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import { profileImage } from "@/data/portfolio";
import { useEffect, useRef, useState } from "react";

function TiltImage({ alt }) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const animRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const handleMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX - cx;
      const my = e.clientY - cy;
      targetRef.current = {
        x: -(my / rect.height) * 14,
        y: (mx / rect.width) * 14
      };
      setGlare({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };

    const handleEnter = () => setHovered(true);
    const handleLeave = () => {
      setHovered(false);
      targetRef.current = { x: 0, y: 0 };
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.08);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.08);
      setTilt({ ...currentRef.current });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    wrap.addEventListener("mousemove", handleMove);
    wrap.addEventListener("mouseenter", handleEnter);
    wrap.addEventListener("mouseleave", handleLeave);

    return () => {
      wrap.removeEventListener("mousemove", handleMove);
      wrap.removeEventListener("mouseenter", handleEnter);
      wrap.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="about-image-tilt-wrap"
      style={{ perspective: "900px", cursor: "default" }}
    >
      <div
        className="about-image-wrap"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.03 : 1})`,
          transition: hovered ? "none" : "transform 0.8s ease",
          transformStyle: "preserve-3d",
          borderRadius: "inherit",
          boxShadow: hovered
            ? "0 32px 80px rgba(14,165,164,0.24), 0 8px 24px rgba(0,0,0,0.18)"
            : "var(--shadow-soft)"
        }}
      >
        <Image
          src={profileImage}
          alt={alt}
          fill
          sizes="(max-width: 768px) 72vw, 300px"
          className="about-image"
          unoptimized
          priority
        />
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, transparent 65%)`,
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 2
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default function About({ copy }) {
  return (
    <section className="section about-section" id="about">
      <style>{`
        .about-image-tilt-wrap {
          width: 100%;
        }
        .about-panel-enhanced {
          overflow: hidden;
          transition: transform 250ms ease, box-shadow 250ms ease;
        }
        .about-panel-enhanced:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(14,165,164,0.16), 0 8px 24px rgba(0,0,0,0.12);
        }
        .highlight-item-animated {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
          color: var(--text);
          padding: 8px 0;
          border-bottom: 1px solid var(--line);
          transition: padding-left 200ms ease, color 200ms ease;
        }
        .highlight-item-animated:last-child { border-bottom: none; }
        .highlight-item-animated:hover {
          padding-left: 6px;
          color: var(--heading);
        }
        .highlight-item-animated svg {
          margin-top: 3px;
          color: var(--accent);
          flex-shrink: 0;
          transition: transform 200ms ease;
        }
        .highlight-item-animated:hover svg {
          transform: scale(1.2) rotate(-5deg);
        }
        .about-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border: 1px solid color-mix(in srgb, var(--accent) 36%, var(--line));
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-family: var(--mono);
          font-size: 0.72rem;
          font-weight: 850;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="section-inner about-grid">
        <div className="about-copy" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="about-panel about-panel-enhanced" data-animate>
          <TiltImage alt={copy.cardTitle} />

          <div className="about-panel-content">
            <div className="about-card-badge">
              <Sparkles size={12} />
              Available for hire
            </div>
            <h3>{copy.cardTitle}</h3>
            <p>{copy.cardMeta}</p>

            <ul style={{ padding: 0, margin: "22px 0 0", listStyle: "none", display: "grid", gap: 0 }}>
              {copy.highlights.map((item) => (
                <li key={item} className="highlight-item-animated">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
