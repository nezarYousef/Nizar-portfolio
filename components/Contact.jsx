import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import PhoneReveal from "@/components/contact/PhoneReveal";
import WhatsappLink from "@/components/contact/WhatsappLink";
import styles from "./Contact.module.css";

export default function Contact({ copy, index }) {
  const socials = [
    { href: copy.links.github, label: "GitHub", Icon: Github },
    { href: copy.links.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: copy.links.instagram, label: "Instagram", Icon: Instagram }
  ];

  return (
    <Section id="contact" index={index} kicker={copy.eyebrow} title={copy.title}>
      <div className={styles.grid}>
        <Reveal className={styles.intro}>
          <p className={`${styles.availability} u-mono`}>
            <span className={styles.availabilityDot} aria-hidden="true" />
            {copy.availability}
          </p>
          <p className={styles.description}>{copy.description}</p>
        </Reveal>

        <Reveal className={styles.panel} delay={80}>
          <a className={styles.method} href={copy.links.email}>
            <Mail size={18} aria-hidden="true" />
            <span>{copy.emailLabel}</span>
          </a>

          <PhoneReveal
            label={copy.phoneLabel}
            revealLabel={copy.showPhone}
            hint={copy.phoneRevealHint}
          />

          <ul className={styles.socials}>
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  className={styles.social}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <WhatsappLink className={styles.social} label="WhatsApp" />
            </li>
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
