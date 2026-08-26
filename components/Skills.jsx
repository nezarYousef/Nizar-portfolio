import FilterGroup from "@/components/FilterGroup";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SkillCard from "@/components/SkillCard";
import styles from "./Skills.module.css";

/* Single primary representation of skills: the six categorized evidence
   cards. The former constellation SVG and "Core Stack" pill cloud were
   removed as duplication - the hero nebula already gives skills a visual
   signature, and every entry here carries linked proof instead of decoration.

   Filtering stays CSS-only (FilterGroup stamps data-filter; display toggles
   per card), so the full set is always in the HTML for search engines and
   no-JS visitors, and each card replays a short entrance when it becomes
   visible again. */

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
              className={styles.category}
              key={category.title}
              delay={categoryIndex * 60}
              data-category={`cat-${categoryIndex}`}
              /* Each card drifts on its own phase and period - negative
                 delays start mid-cycle, so the field never moves in lockstep.
                 Deterministic arithmetic keeps server and client identical. */
              style={{
                "--node-delay": `${categoryIndex * -1730}ms`,
                "--node-dur": `${10.5 + (categoryIndex % 3) * 1.9}s`,
                "--filter-delay": `${categoryIndex * 45}ms`
              }}
            >
              <SkillCard
                index={String(categoryIndex + 1).padStart(2, "0")}
                title={category.title}
                items={category.items}
                projectTitles={projectTitles}
                labels={copy.evidence}
                programLabels={copy.programs}
              />
            </Reveal>
          ))}
        </ul>
      </FilterGroup>
    </Section>
  );
}
