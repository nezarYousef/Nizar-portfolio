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

/* ── Constellation map ───────────────────────────────────────────────────────
   A decorative star-map of the same data: categories are hubs arranged around
   the centre, skills orbit their hub as connected nodes. Positions are fully
   deterministic - derived from index arithmetic, no randomness - so the SVG
   is identical between server render and hydration. It is aria-hidden: this
   is the picture, the evidence index below is the substance. */

const CX = 450;
const CY = 300;

function constellation(categories) {
  const n = categories.length;
  return categories.map((category, i) => {
    const hubAngle = (-90 + i * (360 / n)) * (Math.PI / 180);
    const hx = CX + Math.cos(hubAngle) * 200;
    const hy = CY + Math.sin(hubAngle) * 148;

    const nodes = category.items.map((item, j) => {
      const count = category.items.length;
      /* Depth + angle arithmetic tuned against label collisions: four radius
         steps instead of three and a slightly wider fan keep neighbouring
         labels off each other's lines; the alternating label height below
         breaks the remaining stacks. All deterministic - identical between
         server render and hydration. */
      const spread = count > 1 ? -30 + (60 / (count - 1)) * j : 0;
      const angle = hubAngle + spread * (Math.PI / 180);
      const dist = 104 + (j % 4) * 21;
      /* Three label lanes instead of two: adjacent nodes rarely share a line
         now, which is what still collided after the two-lane pass. */
      return {
        item,
        x: hx + Math.cos(angle) * dist,
        y: hy + Math.sin(angle) * dist * 0.88,
        side: Math.cos(angle) >= 0 ? 1 : -1,
        dy: [-7, 11, 3][j % 3]
      };
    });

    return { key: `cat-${i}`, title: category.title, i, hx, hy, nodes };
  });
}

function Constellation({ categories }) {
  const clusters = constellation(categories);

  const anchorFor = (side) => (side === 1 ? "start" : "end");
  const dxFor = (side) => (side === 1 ? 9 : -9);

  return (
    <svg
      className={styles.constellation}
      viewBox="0 0 900 600"
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <ellipse cx={CX} cy={CY} rx="330" ry="240" className={styles.orbit} />
      <ellipse cx={CX} cy={CY} rx="200" ry="150" className={styles.orbit} />

      {clusters.map((cluster) => (
        <g
          key={cluster.key}
          data-cluster={cluster.key}
          className={styles.cluster}
          style={{ "--float-delay": `${cluster.i * 420}ms` }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={cluster.hx}
            y2={cluster.hy}
            className={styles.spoke}
          />

          {cluster.nodes.map(({ item, x, y, side, dy }, j) => (
            <g key={item.key}>
              <line
                x1={cluster.hx}
                y1={cluster.hy}
                x2={x}
                y2={y}
                className={styles.link}
                style={{ "--link-delay": `${cluster.i * 90 + j * 45}ms` }}
              />
              <circle cx={x} cy={y} r="3.4" className={styles.node} />
              <text
                x={x + dxFor(side)}
                y={y + dy}
                textAnchor={anchorFor(side)}
                className={`${styles.nodeLabel} u-mono`}
              >
                {item.name}
              </text>
            </g>
          ))}

          <circle cx={cluster.hx} cy={cluster.hy} r="7" className={styles.hub} />
          <text
            x={cluster.hx}
            y={
              cluster.hy +
              (Math.sin(Math.atan2(cluster.hy - CY, cluster.hx - CX)) > 0.4
                ? 34
                : Math.sin(Math.atan2(cluster.hy - CY, cluster.hx - CX)) < -0.4
                  ? -26
                  : 10)
            }
            textAnchor="middle"
            className={styles.hubLabel}
          >
            {cluster.title}
          </text>
        </g>
      ))}

      <circle cx={CX} cy={CY} r="4.5" className={styles.coreDot} />
    </svg>
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
        {/* Filtering dims the matching cluster in the map; every cluster stays
            rendered so the picture survives without JavaScript. */}
        <Reveal className={styles.mapWrap}>
          <Constellation categories={copy.categories} />
        </Reveal>

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
                "--node-dur": `${10.5 + (categoryIndex % 3) * 1.9}s`
              }}
            >
              <h3 className={styles.categoryTitle}>
                <span className={`${styles.categoryIndex} u-mono`}>
                  {String(categoryIndex + 1).padStart(2, "0")}
                </span>
                {category.title}
              </h3>

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

      {/* The core stack as a suspended cluster: the same real entries, each
          floating on its own slow phase, scale and glow varying slightly so
          the field reads as objects in space rather than a chip row. */}
      <Reveal className={styles.coreStack}>
        <h3 className={`${styles.coreStackTitle} u-mono`}>
          {copy.evidence.coreStackTitle}
        </h3>
        <ul className={styles.coreField}>
          {copy.coreStack.map((entry, entryIndex) => (
            <li
              className={`${styles.coreNode} u-mono`}
              key={entry}
              style={{
                "--node-delay": `${entryIndex * -1370}ms`,
                "--node-dur": `${8.5 + (entryIndex % 4) * 1.3}s`,
                "--node-scale":
                  entryIndex % 3 === 0 ? "1" : entryIndex % 3 === 1 ? "0.95" : "1.06"
              }}
            >
              {entry}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
