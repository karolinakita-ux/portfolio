import { HeadingAnchor } from "#shared/ui/HeadingAnchor/HeadingAnchor.tsx";

import { callout, styles } from "./Callout.styles.ts";
import type { CalloutProps } from "./Callout.types.ts";

const HEADINGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

/**
 * Callout / InfoBanner - status-tinted container (warning | info).
 * Plain usage: children render as one Body Large paragraph.
 * With `title`: Title Medium semibold heading (H3 unless `headingLevel` says otherwise), then children as
 * structured content. With `title` and `id`: linkable like a Section (the id is the URL hash, the title gets a
 * copy-link anchor and takes focus when a link lands on it).
 */
export function Callout({ tone, label, title, headingLevel = 3, id, children }: CalloutProps) {
  const Heading = HEADINGS[headingLevel];
  const anchor = title && id ? { id, titleId: id + "-title" } : null;
  const heading = (
    <Heading id={anchor?.titleId} tabIndex={anchor ? -1 : undefined} className={styles.title}>
      {title}
    </Heading>
  );
  return (
    <aside id={anchor?.id} aria-label={label} data-anchor={anchor ? "" : undefined} className={callout({ tone })}>
      {title ? (
        <div className={styles.titled}>
          {anchor ? (
            <div className={styles.titleRow}>
              {heading}
              <HeadingAnchor id={anchor.id} headingId={anchor.titleId} label={title} />
            </div>
          ) : (
            heading
          )}
          {children}
        </div>
      ) : (
        <p>{children}</p>
      )}
    </aside>
  );
}
