import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import FilterGroup from "@/components/FilterGroup";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import GalleryButton from "@/components/projects/GalleryButton";
import GalleryProvider from "@/components/projects/GalleryProvider";
import TiltPanel from "@/components/projects/TiltPanel";
import { FILTERS, categoriesFor } from "@/lib/projectCategories";
import styles from "./Projects.module.css";

function Preview({ project, label }) {
  const previewImage = project.cover ?? project.gallery?.[0]?.src;

  if (!previewImage) {
    return (
      <TiltPanel className={styles.frame}>
        <div className={`${styles.previewEmpty} u-mono`} aria-hidden="true">
          {label}
        </div>
      </TiltPanel>
    );
  }

  return (
    <TiltPanel className={styles.frame}>
      <div className={styles.preview}>
        <Image
          className={styles.previewImage}
          src={previewImage}
          alt=""
          width={640}
          height={400}
          sizes="(max-width: 899px) 92vw, 460px"
          data-fit={project.previewFit ?? "cover"}
        />
      </div>
      <span className={styles.sheen} aria-hidden="true" />
    </TiltPanel>
  );
}

/* Every project carries a Live Demo and a GitHub affordance. When the URL
   has not been added to data/projects.js yet, the button renders as a
   disabled "Coming soon" placeholder - dashed, inert, and holding its place,
   so dropping a real URL into the data file later flips it to a working link
   with zero JSX changes. */
function LinkButton({ href, label, soonLabel, icon: Icon, className }) {
  if (!href) {
    return (
      <button
        type="button"
        className={className}
        disabled
        aria-disabled="true"
        title={soonLabel}
      >
        <Icon size={16} aria-hidden="true" />
        <span>{soonLabel}</span>
      </button>
    );
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
      <ExternalLink size={12} aria-hidden="true" className={styles.externalMark} />
    </a>
  );
}

export default function Projects({ copy, projects, archive, index }) {
  const options = FILTERS.map((value) => ({
    value,
    label: copy.filters[value]
  }));

  return (
    <Section id="projects" index={index} kicker={copy.eyebrow} title={copy.title}>
      <GalleryProvider
        projects={projects}
        labels={copy}
        modalCopy={copy.modalCopy}
      >
        <FilterGroup options={options} label={copy.filterLabel}>
          <ol className={styles.list}>
            {projects.map((project, position) => {
              const categories = categoriesFor(project.tags);
              const shots = project.gallery?.length ?? 0;

              return (
                <Reveal
                  as="li"
                  className={styles.scene}
                  key={project.id}
                  data-categories={categories.join(" ")}
                  data-flip={position % 2 === 1 ? "true" : undefined}
                  data-cursor="view"
                  data-cursor-text={String(position + 1).padStart(2, "0")}
                  style={{ "--filter-delay": `${position * 60}ms` }}
                >
                  <p
                    className={`${styles.numeral} u-mono`}
                    aria-hidden="true"
                  >
                    {String(position + 1).padStart(2, "0")}
                  </p>

                  <article className={styles.stage}>
                    <div className={styles.main}>
                      <p className={`${styles.sceneIndex} u-mono`}>
                        <span className={styles.sceneMark} aria-hidden="true" />
                        {String(position + 1).padStart(2, "0")}
                      </p>

                      <h3 className={styles.title}>{project.title}</h3>
                      <p className={styles.description}>{project.description}</p>

                      <ul className={styles.tags}>
                        {project.tags.map((tag) => (
                          <li className={`${styles.tag} u-mono`} key={tag}>
                            {tag}
                          </li>
                        ))}
                      </ul>

                      <div className={styles.actions}>
                        {shots > 0 ? (
                          <GalleryButton
                            id={project.id}
                            className={styles.action}
                            label={`${copy.viewGallery} (${shots} ${copy.screenshots})`}
                          />
                        ) : null}

                        <LinkButton
                          href={project.liveUrl}
                          label={copy.viewLive}
                          soonLabel={copy.soon}
                          icon={ExternalLink}
                          className={styles.action}
                        />

                        <LinkButton
                          href={project.repoUrl}
                          label={copy.viewGithub}
                          soonLabel={copy.soon}
                          icon={Github}
                          className={styles.action}
                        />
                      </div>
                    </div>

                    <Preview project={project} label={copy.inDevelopment} />
                  </article>
                </Reveal>
              );
            })}
          </ol>
        </FilterGroup>
      </GalleryProvider>

      {/* Compact archive for the non-featured set: title, tags, links - the
          work stays listed without competing with the showcase above. */}
      {archive.length ? (
        <div className={styles.archive}>
          <h3 className={`${styles.archiveTitle} u-mono`}>{copy.archiveTitle}</h3>
          <ul className={styles.archiveList}>
            {archive.map((project) => (
              <li className={styles.archiveItem} key={project.id}>
                <div className={styles.archiveMain}>
                  <h4 className={styles.archiveName}>{project.title}</h4>
                  <p className={styles.archiveDescription}>
                    {project.description}
                  </p>
                  <ul className={styles.tags}>
                    {project.tags.map((tag) => (
                      <li className={`${styles.tag} u-mono`} key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.archiveActions}>
                  <LinkButton
                    href={project.liveUrl}
                    label={copy.viewLive}
                    soonLabel={copy.soon}
                    icon={ExternalLink}
                    className={`${styles.action} ${styles.actionSm}`}
                  />
                  <LinkButton
                    href={project.repoUrl}
                    label={copy.viewGithub}
                    soonLabel={copy.soon}
                    icon={Github}
                    className={`${styles.action} ${styles.actionSm}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
