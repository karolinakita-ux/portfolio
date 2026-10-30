import { BentoVisual } from "#features/case-studies/components/BentoVisual/BentoVisual.tsx";
import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";

import { styles } from "./BentoCards.styles.ts";
import type { BentoCardsProps } from "./BentoCards.types.ts";

/**
 * Numbered bento cards (01, 02 ...): Card surfaces in a grid, each with a status badge (Shipped · MVP: success,
 * Phase 2 · Roadmap: warning), a title, a short body and an optional small visual. Wide cards span two columns.
 * Every colour is a token, so Light and Dark mode come free; sample brand colours inside a visual are content.
 * They close a case study, so they stay still (no scroll reveal), like the closing lists they replaced.
 */
export function BentoCards({ items, start = 1, columns = 3 }: BentoCardsProps) {
  return (
    <ol className={styles.list(columns)}>
      {items.map((item, index) => {
        const wide = columns === 3 && item.wide === true;
        return (
          <Card key={item.title} as="li" gap="sm" reveal={false} className={styles.item(wide)}>
            <div className={styles.header}>
              <span aria-hidden="true" className={styles.number}>
                {String(start + index).padStart(2, "0")}
              </span>{" "}
              {item.status ? (
                <Badge tone={item.status.tone === "shipped" ? "success" : "warning"} weight="medium">
                  {item.status.label}
                </Badge>
              ) : null}
            </div>{" "}
            <h3 className={styles.title}>{item.title}</h3> <p className={styles.body}>{item.body}</p>
            {item.visual ? (
              <div className={styles.visual}>
                <BentoVisual visual={item.visual} />
              </div>
            ) : null}
          </Card>
        );
      })}
    </ol>
  );
}
