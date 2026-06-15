import { BriefcaseBusiness, GraduationCap } from "lucide-react";

export default function TimelineSection({ copy, iconType, id }) {
  const Icon = iconType === "experience" ? BriefcaseBusiness : GraduationCap;

  return (
    <section className={`section timeline-section ${id}-section`} id={id}>
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="timeline">
          {copy.items.map((item, index) => (
            <article
              className="timeline-item"
              data-animate
              key={`${item.title}-${item.date}`}
              style={{ "--delay": `${index * 80}ms` }}
            >
              <div className="timeline-icon" aria-hidden="true">
                <Icon size={20} />
              </div>
              <div className="timeline-content">
                <div className="timeline-topline">
                  <h3>{item.title}</h3>
                  <span>{item.date}</span>
                </div>
                <p className="timeline-company">{item.company}</p>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
