import type { ReactNode } from "react";

import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./PrivacySectionView.styles.ts";
import type { PrivacySectionViewProps } from "./PrivacySectionView.types.ts";

/** Plain paragraphs at reading width; nothing when there are none. */
function Paragraphs({ items }: { items: readonly ReactNode[] }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.prose}>
      {items.map((paragraph, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- static copy in fixed order
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

/**
 * One part of the privacy policy: paragraphs and an optional bullet list, then the paragraphs that lead
 * into the section's own component, the component, and closing paragraphs. All at reading width.
 */
export function PrivacySectionView({ section, extra }: PrivacySectionViewProps) {
  const { id, title, paragraphs = [], points = [], intro = [], after = [] } = section;
  return (
    <Section id={id} title={title}>
      {(paragraphs.length > 0 || points.length > 0) && (
        <div className={styles.prose}>
          {paragraphs.map((paragraph, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- static copy in fixed order
            <p key={index}>{paragraph}</p>
          ))}
          {points.length > 0 && (
            <ul className={styles.points}>
              {points.map((point, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- static copy in fixed order
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Paragraphs items={intro} />
      {extra !== undefined && <div className={styles.extra}>{extra}</div>}
      <Paragraphs items={after} />
    </Section>
  );
}
