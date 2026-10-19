import { HeadingAnchor } from "#shared/ui/HeadingAnchor/HeadingAnchor.tsx";

import { styles } from "./CvSection.styles.ts";
import type { CvSectionProps } from "./CvSection.types.ts";

/** A CV section: standard ATS heading with a copy-link anchor, then its content. */
export function CvSection({ id, title, keepTogether = false, children }: CvSectionProps) {
  const titleId = "cv-" + id + "-title";
  return (
    <section id={id} aria-labelledby={titleId} data-anchor="" className={styles.root(keepTogether)}>
      <div className={styles.header}>
        <h2 id={titleId} tabIndex={-1} className={styles.title}>
          {title}
        </h2>
        <HeadingAnchor id={id} headingId={titleId} label={title} />
      </div>
      {children}
    </section>
  );
}
