import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { HeadingAnchor } from "#shared/ui/HeadingAnchor/HeadingAnchor.tsx";

import { styles } from "./FeatureSection.styles.ts";
import type { FeatureSectionProps } from "./FeatureSection.types.ts";

/**
 * Figma: case-study feature section. Text column (eyebrow, H2 with its copy-link anchor, lead, bullets) beside
 * a visual column of one or more screenshots, which open the image viewer. From lg the columns sit side by side
 * and every other section is mirrored (`reverse`); below lg they stack, text first.
 */
export function FeatureSection({ section, rows, reverse = false }: FeatureSectionProps) {
  const titleId = section.id + "-title";
  return (
    <section id={section.id} aria-labelledby={titleId} data-anchor="" className={styles.root}>
      <Container>
        <div className={styles.grid(reverse)}>
          <div className={styles.text}>
            <Eyebrow parts={[section.eyebrow]} />
            <div className={styles.titleRow}>
              <h2 id={titleId} tabIndex={-1} className={styles.title}>
                {section.title}
              </h2>
              <HeadingAnchor id={section.id} headingId={titleId} label={section.title} />
            </div>
            <p className={styles.lead}>{section.lead}</p>
            <ul className={BULLET_LIST}>
              {section.bullets.map((bullet, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          </div>{" "}
          <ul aria-label={section.title + " - screens"} className={styles.media(reverse)}>
            {rows.map((row) => (
              <li key={row.card.id}>
                <Screenshot
                  src={row.src}
                  darkSrc={row.darkSrc}
                  alt={row.card.alt}
                  onExpand={row.onExpand}
                  frameless={row.card.frameless}
                />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
