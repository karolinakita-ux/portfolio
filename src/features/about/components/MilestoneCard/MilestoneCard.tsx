import { useId } from "react";

import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";

import { styles } from "./MilestoneCard.styles.ts";
import type { MilestoneCardProps } from "./MilestoneCard.types.ts";

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId}>
      <p className={styles.period}>{milestone.period}</p>
      <div className={styles.heading}>
        <h3 id={titleId} className={styles.title}>
          {milestone.title}
        </h3>
        <p className={styles.org}>{milestone.org}</p>
      </div>
      <dl className={styles.focus}>
        <dt className={styles.focusTerm}>Focus:</dt>
        <dd className={styles.focusValue}>{milestone.focus}</dd>
      </dl>
      {/* Optional reflection quote - omitted on cards without a `lesson` */}
      {milestone.lesson && (
        <blockquote className={styles.lesson}>
          <p>“{milestone.lesson}”</p>
        </blockquote>
      )}
      <ul aria-label="Skills" className={styles.tags}>
        {milestone.tags.map((tag) => (
          <Badge as="li" key={tag}>
            {tag}
          </Badge>
        ))}
      </ul>
    </Card>
  );
}
