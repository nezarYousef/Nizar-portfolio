import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { profileImage } from "@/data/portfolio";

export default function About({ copy }) {
  return (
    <section className="section about-section" id="about">
      <div className="section-inner about-grid">
        <div className="about-copy" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="about-panel" data-animate>
          <div className="about-image-wrap">
            <Image
              src={profileImage}
              alt={copy.cardTitle}
              fill
              sizes="(max-width: 768px) 88vw, 360px"
              className="about-image"
            />
          </div>

          <div className="about-panel-content">
            <h3>{copy.cardTitle}</h3>
            <p>{copy.cardMeta}</p>

            <ul className="highlight-list">
              {copy.highlights.map((item) => (
                <li key={item}>
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
