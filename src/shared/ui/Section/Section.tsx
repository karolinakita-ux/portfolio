import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { HeadingAnchor } from "#shared/ui/HeadingAnchor/HeadingAnchor.tsx";

import { sectionBody, styles } from "./Section.styles.ts";
import type { SectionProps } from "./Section.types.ts";

/**
 * Page section: optional eyebrow, Headline Large / Display Small heading with a copy-link anchor, optional lead, content.
 * `id` is the section's URL hash (/about#career); the URL follows it while scrolling (useSectionHash).
 */
export function Section({ id, title, eyebrow, description, children, headingProps, bodyGap }: SectionProps) {
  const titleId = id + "-title";
  const paragraphs = description === undefined ? [] : typeof description === "string" ? [description] : description;
  return (
    <section id={id} aria-labelledby={titleId} data-anchor="" className={styles.root}>
      <Container>
        <div className={sectionBody({ gap: bodyGap })}>
          <div className={styles.header}>
            {eyebrow ? <Eyebrow parts={[eyebrow]} /> : null}
            <div className={styles.titleRow}>
              <h2 id={titleId} tabIndex={-1} className={styles.title} {...headingProps}>
                {title}
              </h2>
              <HeadingAnchor id={id} headingId={titleId} label={title} />
            </div>
            {paragraphs.map((paragraph, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- static paragraphs in fixed order
              <p key={index} className={styles.paragraph(index)}>
                {paragraph}
              </p>
            ))}
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}
