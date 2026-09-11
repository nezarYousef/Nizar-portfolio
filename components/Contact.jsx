"use client";

import { ArrowUpRight, Github, Instagram, Linkedin, Mail, MessageCircle, Phone } from "lucide-react";
import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import styles from "./Contact.module.css";

const emailAddress = (href) => href.replace(/^mailto:/, "");

export default function Contact({ copy, language }) {
  const sectionRef = useRef(null);
  useReveal(sectionRef, [language]);

  const socials = [
    { href: copy.links.github, label: "GitHub", icon: Github },
    { href: copy.links.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: copy.links.whatsapp, label: "WhatsApp", icon: MessageCircle },
    { href: copy.links.instagram, label: "Instagram", icon: Instagram }
  ];

  return (
    <section className={`section ${styles.contact}`} id="contact" ref={sectionRef} aria-labelledby="contact-title">
      <div className="container">
        <p className="kicker" data-reveal="">
          <b>07</b>
          <span>{copy.eyebrow}</span>
        </p>

        <h2 className={styles.statement} id="contact-title" data-reveal="">
          {copy.title}
        </h2>

        <div className={styles.grid}>
          <div className={styles.intro} data-reveal="">
            <p className={styles.badge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              {copy.badge}
            </p>
            <p className={styles.description}>{copy.description}</p>
          </div>

          <div className={styles.methods} data-reveal="" style={{ "--delay": "80ms" }}>
            <a className={styles.method} href={copy.links.email}>
              <Mail size={20} aria-hidden="true" />
              <span className={styles.methodText}>
                <small>{copy.emailLabel}</small>
                <strong>{emailAddress(copy.links.email)}</strong>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" className={styles.arrow} />
            </a>
            <a className={styles.method} href={copy.links.phone}>
              <Phone size={20} aria-hidden="true" />
              <span className={styles.methodText}>
                <strong>{copy.phoneLabel}</strong>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" className={styles.arrow} />
            </a>

            <ul className={styles.socials}>
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
