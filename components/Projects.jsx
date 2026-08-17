import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import FilterGroup from "@/components/FilterGroup";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import GalleryButton from "@/components/projects/GalleryButton";
import GalleryProvider from "@/components/projects/GalleryProvider";
import { FILTERS, categoriesFor } from "@/lib/projectCategories";
import styles from "./Projects.module.css";

function Preview({ project, label }) {
  const previewImage = project.previewImage ?? project.gallery?.[0]?.src;

  if (!previewImage) {
    return (
      <div className={`${styles.previewEmpty} u-mono`} aria-hidden="true">
        {label}
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      <Image
        className={styles.previewImage}
        src={previewImage}
        alt=""
        width={640}
        height={400}
        sizes="(max-width: 899px) 92vw, 260px"
        data-fit={project.previewFit ?? "cover"}
      />
    </div>
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
                  className={styles.row}
                  key={project.id}
                  delay={position * 40}
                  data-categories={categories.join(" ")}
                >
                  <article className={styles.rowInner}>
                    <p className={`${styles.index} u-mono`} aria-hidden="true">
                      {String(position + 1).padStart(2, "0")}
                    </p>

                    <div className={styles.main}>
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
