import { useId } from "react";

import { ComparisonSide } from "#features/case-studies/components/ComparisonSide/ComparisonSide.tsx";
import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Callout } from "#shared/ui/Callout/Callout.tsx";

import { styles } from "./ComparisonBlock.styles.ts";
import type { ComparisonBlockProps } from "./ComparisonBlock.types.ts";

/**
 * Figma: Compare. A before / after comparison: H3 and intro, the two columns side by side from md (stacked
 * below), then the reasoning - titled columns of points, or a "Strategic shift" list in an info banner.
 * `data-card`: visitor statistics name a click on it that does nothing by its title (shared/lib/analytics).
 */
export function ComparisonBlock({ comparison, beforeRows, afterRows }: ComparisonBlockProps) {
  const titleId = useId();
  return (
    <article data-card="" aria-labelledby={titleId} className={styles.root}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {comparison.title}
        </h3>
        {comparison.intro ? <p className={styles.intro}>{comparison.intro}</p> : null}
      </div>
      <div className={styles.columns}>
        <ComparisonSide side={comparison.before} rows={beforeRows} tone="before" />{" "}
        <ComparisonSide side={comparison.after} rows={afterRows} tone="after" />
      </div>
      {comparison.rationale && (
        <div className={styles.rationale}>
          {comparison.rationale.map((column) => (
            <div key={column.title} className={styles.rationaleColumn}>
              <h4 className={styles.rationaleTitle}>{column.title}</h4>
              <ul className={BULLET_LIST}>
                {column.points.map((point, index) => (
                  // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {comparison.shift && (
        <Callout tone="info" label={comparison.shift.title} title={comparison.shift.title}>
          <ul className={styles.shiftList}>
            {comparison.shift.points.map((point) => (
              <li key={point} className={styles.shiftItem}>
                <span aria-hidden="true">→</span> <span>{point}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </article>
  );
}
