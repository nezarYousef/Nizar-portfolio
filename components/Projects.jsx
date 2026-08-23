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
  const previewImage = project.previewImage ?? project.gallery?.[0]?.src;

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
          sizes="(max-width: 899px) 92vw, 420px"
          data-fit={project.previewFit ?? "cover"}
        />
      </div>
      <span className={styles.sheen} aria-hidden="true" />
    </TiltPanel>
  );
}

export default function Projects({ copy, index }) {
  const options = FILTERS.map((value) => ({
    value,
    label: copy.filters[value]
  }));

  return (
    <Section id="projects" index={index} kicker={copy.eyebrow} title={copy.title}>
      <GalleryProvider
        projects={copy.list}
        labels={copy}
        modalCopy={copy.modalCopy}
      >
        <FilterGroup options={options} label={copy.filterLabel}>
          <ol className={styles.list}>
            {copy.list.map((project, position) => {
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

                        {project.github ? (
                          <a
                            className={styles.action}
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github size={16} aria-hidden="true" />
                            <span>{copy.viewGithub}</span>
                            <ExternalLink
                              size={12}
                              aria-hidden="true"
                              className={styles.externalMark}
                            />
                          </a>
                        ) : null}

                        {!project.github && shots === 0 ? (
                          <GalleryButton
                            id={project.id}
                            variant="pending"
                            className={styles.action}
                            label={copy.comingSoon}
                          />
                        ) : null}
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
    </Section>
  );
}
