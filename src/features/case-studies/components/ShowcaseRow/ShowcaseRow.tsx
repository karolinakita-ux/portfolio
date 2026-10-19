import { useId } from "react";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";

import { styles } from "./ShowcaseRow.styles.ts";
import type { ShowcaseRowProps } from "./ShowcaseRow.types.ts";

/** Screenshot left, rationale right (stacks on mobile). */
export function ShowcaseRow({ src, previewSrc, item, onExpand }: ShowcaseRowProps) {
  const titleId = useId();
  return (
    <Card layout="media" gap="lg" aria-labelledby={titleId} className={styles.root}>
      <Screenshot
        src={previewSrc ?? src}
        fallbackSrc={previewSrc ? src : undefined}
        alt={item.alt}
        onExpand={onExpand}
      />
      <div className={styles.body}>
        <h3 id={titleId} className={styles.title}>
          {item.title}
        </h3>
        {item.intro ? <p className={styles.intro}>{item.intro}</p> : null}
        {/* Optional secondary titled paragraphs within one screenshot row */}
        {item.blocks?.map((block) => (
          <div key={block.title} className={styles.block}>
            <h4 className={styles.blockTitle}>{block.title}</h4>
            <p className={styles.blockBody}>{block.body}</p>
          </div>
        ))}
        {item.bullets && (
          <ul className={BULLET_LIST}>
            {item.bullets.map((bullet, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
