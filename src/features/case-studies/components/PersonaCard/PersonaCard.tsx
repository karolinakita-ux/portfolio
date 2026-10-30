import { useId } from "react";

import { Avatar } from "#shared/ui/Avatar/Avatar.tsx";
import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";

import { styles } from "./PersonaCard.styles.ts";
import type { PersonaCardProps } from "./PersonaCard.types.ts";

/**
 * Figma: persona card. Name, role and the lines they ride; role and context; main goal; everyday problems;
 * how the product helps. Real text rather than an image, so it reads on a phone, in Dark mode and to a screen reader.
 */
export function PersonaCard({ persona }: PersonaCardProps) {
  const nameId = useId();
  return (
    <Card as="article" gap="md" aria-labelledby={nameId}>
      <div className={styles.header}>
        <Avatar initials={persona.initials} />{" "}
        <div className={styles.identity}>
          <h3 id={nameId} className={styles.name}>
            {persona.name}
          </h3>{" "}
          <p className={styles.role}>{persona.role}</p>
        </div>
      </div>
      <ul aria-label="Lines" className={styles.lines}>
        {persona.lines.map((line) => (
          <Badge key={line} as="li" weight="medium">
            {line}
          </Badge>
        ))}
      </ul>
      <div className={styles.block}>
        <h4 className={styles.label}>Role & context</h4> <p className={styles.text}>{persona.context}</p>
      </div>
      <div className={styles.goal}>
        <h4 className={styles.goalLabel}>Main goal</h4> <p className={styles.goalText}>{persona.goal}</p>
      </div>
      <div className={styles.block}>
        <h4 className={styles.label}>Everyday problems</h4>
        <ul className={styles.list}>
          {persona.problems.map((problem, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
            <li key={index}>{problem}</li>
          ))}
        </ul>
      </div>
      <div className={styles.block}>
        <h4 className={styles.label}>How Smart Ticket helps</h4>
        <ul className={styles.list}>
          {persona.helps.map((help, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
            <li key={index}>{help}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
