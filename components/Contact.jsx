import { Github, Instagram, Linkedin, Mail, MessageCircle, Phone, Send } from "lucide-react";

export default function Contact({ copy }) {
  const socials = [
    { href: copy.links.github, label: "GitHub", icon: Github },
    { href: copy.links.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: copy.links.whatsapp, label: "WhatsApp", icon: MessageCircle },
    { href: copy.links.instagram, label: "Instagram", icon: Instagram }
  ];

  return (
    <section className="section contact-section" id="contact">
      <div className="section-inner contact-grid">
        <div data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
          <p className="contact-description">{copy.description}</p>
        </div>

        <div className="contact-panel" data-animate>
          <a className="contact-method" href={copy.links.email}>
            <Mail size={20} />
            <span>{copy.emailLabel}</span>
            <Send size={16} />
          </a>
          <a className="contact-method" href={copy.links.phone}>
            <Phone size={20} />
            <span>{copy.phoneLabel}</span>
          </a>

          <div className="social-links">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                className="icon-button social-link"
                href={href}
                key={label}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
              >
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
