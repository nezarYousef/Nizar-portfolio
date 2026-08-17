import FilterGroup from "@/components/FilterGroup";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import styles from "./Skills.module.css";

/* Every skill states what proves it. `projects` and `programs` are ids that
   resolve against content already on the page, so a claim and its evidence
   can never drift apart. Skills with neither render as a plain name rather
   than borrowing credibility they do not have. */
function Evidence({ item, labels, projectTitles, programLabels }) {
  const projects = item.projects.map((id) => projectTitles[id]).filter(Boolean);
  const programs = item.programs.map((key) => programLabels[key]).filter(Boolean);

  if (!projects.length && !programs.length) return null;

  return (
    <dl className={styles.evidence}>
      {projects.length ? (
        <div className={styles.evidenceRow}>
          <dt className={`${styles.evidenceLabel} u-mono`}>{labels.usedIn}</dt>
          <dd className={styles.evidenceValue}>
            {projects.map((title) => (
              <a className={styles.evidenceLink} href="#projects" key={title}>
                {title}
              </a>
            ))}
          </dd>
        </div>
      ) : null}

      {programs.length ? (
        <div className={styles.evidenceRow}>
          <dt className={`${styles.evidenceLabel} u-mono`}>{labels.studiedIn}</dt>
          <dd className={styles.evidenceValue}>
            {programs.map((title) => (
              <span className={styles.evidenceProgram} key={title}>
                {title}
              </span>
            ))}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export default function Skills({ copy, projects, index }) {
  const projectTitles = Object.fromEntries(
    projects.map((project) => [project.id, project.title])
  );

  const options = [
    { value: "all", label: copy.evidence.filterAll },
    ...copy.categories.map((category, position) => ({
      value: `cat-${position}`,
      label: category.title
    }))
  ];

  return (
    <Section id="skills" index={index} kicker={copy.eyebrow} title={copy.title}>
      <FilterGroup options={options} label={copy.evidence.filterLabel}>
        <ul className={styles.grid}>
          {copy.categories.map((category, categoryIndex) => (
            <Reveal
              as="li"
              className={styles.card}
              key={category.title}
              delay={categoryIndex * 60}
              data-category={`cat-${categoryIndex}`}
            >
              <h3 className={styles.cardTitle}>{category.title}</h3>

              <ul className={styles.skillList}>
                {category.items.map((item) => (
                  <li className={styles.skill} key={item.key}>
                    <p className={styles.skillName}>{item.name}</p>
                    <Evidence
                      item={item}
                      labels={copy.evidence}
                      projectTitles={projectTitles}
                      programLabels={copy.programs}
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </FilterGroup>

      <Reveal className={styles.coreStack}>
        <h3 className={`${styles.coreStackTitle} u-mono`}>
          {copy.evidence.coreStackTitle}
        </h3>
        <ul className={styles.coreStackList}>
          {copy.coreStack.map((entry) => (
            <li className={`${styles.coreStackItem} u-mono`} key={entry}>
              {entry}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
