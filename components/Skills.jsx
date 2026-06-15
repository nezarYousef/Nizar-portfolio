import { Code2 } from "lucide-react";

export default function Skills({ copy }) {
  return (
    <section className="section skills-section" id="skills">
      <div className="section-inner">
        <div className="section-heading" data-animate>
          <p className="section-kicker">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="skills-grid">
          {copy.categories.map((category, index) => (
            <article
              className="skill-card tilt-card"
              data-animate
              key={category.title}
              style={{ "--delay": `${index * 60}ms` }}
            >
              <div className="skill-card-icon">
                <Code2 size={20} />
              </div>
              <h3>{category.title}</h3>
              <div className="skill-tags">
                {category.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
