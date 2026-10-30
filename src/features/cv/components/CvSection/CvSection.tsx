import { HeadingAnchor } from "#shared/ui/HeadingAnchor/HeadingAnchor.tsx";

import { styles } from "./CvSection.styles.ts";
import type { CvSectionProps } from "./CvSection.types.ts";

/**
 * A CV section (Figma CV frame): the label column (an uppercase heading with its copy-link anchor and the gold bar)
 * beside the content, side by side from md and on paper. `id` is the section's URL hash (/cv#experience).
 */
export function CvSection({ id, title, children }: CvSectionProps) {
  const titleId = id + "-title";
  return (
    <section id={id} aria-labelledby={titleId} data-anchor="" className={styles.root}>
      <div className={styles.label}>
        <div className={styles.titleRow}>
          <h2 id={titleId} tabIndex={-1} className={styles.title}>
            {title}
          </h2>
          <HeadingAnchor id={id} headingId={titleId} label={title} />
        </div>
        <span aria-hidden="true" className={styles.rule} />
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
