import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

export default function OtherExperience({ copy }) {
  return (
    <section className="section other-experience-section" id="other-experience">
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="other-experience-viewport" data-animate>
          <div className="other-experience-track">
            {[0, 1].map((groupIndex) => (
              <div
                className="other-experience-group"
                key={groupIndex}
                aria-hidden={groupIndex === 1}
              >
                {copy.items.map((item) => (
                  <article className="other-experience-card" key={`${item.title}-${groupIndex}`}>
                    <div className="other-experience-image-wrap">
                      <Image
                        src={item.image}
                        alt={item.imageAlt}
                        fill
                        sizes="(max-width: 680px) 280px, 340px"
                        className="other-experience-image"
                        style={{ objectPosition: item.imagePosition ?? "center" }}
                      />
                    </div>

                    <div className="other-experience-body">
                      <div className="other-experience-topline">
                        <h3>{item.title}</h3>
                        <span>
                          <CalendarDays size={14} />
                          {item.date}
                        </span>
                      </div>

                      <p className="other-experience-company">
                        <MapPin size={14} />
                        {item.company}
                      </p>

                      <ul>
                        {item.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
