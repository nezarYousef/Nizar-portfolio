"use client";

import { Github, Instagram, Linkedin, Mail, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Contact({ copy }) {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const socials = [
    { href: copy.links.github, label: "GitHub", icon: Github, color: "var(--heading)" },
    { href: copy.links.linkedin, label: "LinkedIn", icon: Linkedin, color: "#0a66c2" },
    { href: copy.links.whatsapp, label: "WhatsApp", icon: MessageCircle, color: "#25d366" },
    { href: copy.links.instagram, label: "Instagram", icon: Instagram, color: "#e1306c" }
  ];

  return (
    <section className="section contact-section" id="contact">
      <style>{`
        .contact-method-glow {
          position: relative;
          overflow: hidden;
        }
        .contact-method-glow::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--accent-soft), transparent, var(--accent-soft));
          opacity: 0;
          transition: opacity 300ms ease;
          pointer-events: none;
        }
        .contact-method-glow:hover::before {
          opacity: 1;
          animation: contactMethodShimmer 1.2s ease infinite;
        }
        @keyframes contactMethodShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .social-link-enhanced {
          position: relative;
          transition: transform 220ms cubic-bezier(0.34,1.56,0.64,1), border-color 220ms ease, box-shadow 220ms ease !important;
        }
        .social-link-enhanced:hover {
          transform: translateY(-5px) scale(1.12) !important;
        }
        .contact-availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border: 1px solid color-mix(in srgb, var(--teal) 40%, var(--line));
          border-radius: 999px;
          background: color-mix(in srgb, var(--teal) 8%, var(--surface));
          color: color-mix(in srgb, var(--teal) 80%, var(--text));
          font-family: var(--mono);
          font-size: 0.78rem;
          font-weight: 850;
          margin-bottom: 18px;
        }
        .contact-availability-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--teal) 60%, transparent); }
          50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--teal) 0%, transparent); }
        }
        .contact-panel-3d {
          transition: transform 250ms ease, box-shadow 250ms ease;
        }
        .contact-panel-3d:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-3d);
        }
      `}</style>

      <div className="section-inner contact-grid">
        <div data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>

          <div className="contact-availability-badge">
            <span className="contact-availability-dot" aria-hidden="true" />
            Available for new opportunities
          </div>

          <p className="contact-description">{copy.description}</p>
        </div>

        <div className="contact-panel contact-panel-3d" data-animate>
          <a className="contact-method contact-method-glow" href={copy.links.email}>
            <Mail size={20} />
            <span>{copy.emailLabel}</span>
            <Send size={16} />
          </a>
          <a className="contact-method contact-method-glow" href={copy.links.phone}>
            <Phone size={20} />
            <span>{copy.phoneLabel}</span>
          </a>

          <div className="social-links" style={{ marginTop: "14px" }}>
            {socials.map(({ href, icon: Icon, label, color }) => (
              <a
                className="icon-button social-link social-link-enhanced"
                href={href}
                key={label}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                style={{
                  borderColor: hoveredSocial === label
                    ? `color-mix(in srgb, ${color} 60%, var(--line))`
                    : "var(--line)",
                  boxShadow: hoveredSocial === label
                    ? `0 8px 24px color-mix(in srgb, ${color} 22%, transparent)`
                    : "none"
                }}
                onMouseEnter={() => setHoveredSocial(label)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                <Icon
                  size={19}
                  style={{
                    color: hoveredSocial === label ? color : "var(--heading)",
                    transition: "color 180ms ease"
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
