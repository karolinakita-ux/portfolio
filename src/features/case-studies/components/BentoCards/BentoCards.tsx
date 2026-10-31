import { BentoVisual } from "#features/case-studies/components/BentoVisual/BentoVisual.tsx";
import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";

import { styles } from "./BentoCards.styles.ts";
import type { BentoCardsProps } from "./BentoCards.types.ts";

/**
 * Numbered bento cards (01, 02 ...): Card surfaces in a grid, each with a status badge (Shipped · MVP: success,
 * Phase 2 · Roadmap: warning), a title, a short body and an optional small visual. Wide cards span two columns.
 * Every colour is a token, so Light and Dark mode come free; sample brand colours inside a visual are content.
 * They close a case study (the roadmap and the handoff), so they stay still: no scroll reveal after the impact
 * (docs/motion.md, Scroll reveal).
 *
 * A list that continues the numbering (start 5: 05, 06) carries `start`, and its numbers stay readable for
 * screen readers, which count every list from 1 ("1 of 2"). In a list from 01 the number only repeats the
 * position they announce, so it is hidden from them there.
 */
export function BentoCards({ items, start = 1, columns = 3 }: BentoCardsProps) {
  const continued = start > 1;
  const numberHidden = continued ? undefined : true;
  return (
    <ol start={continued ? start : undefined} className={styles.list(columns)}>
      {items.map((item, index) => {
        const wide = columns === 3 && item.wide === true;
        return (
          <Card key={item.title} as="li" gap="sm" reveal={false} className={styles.item(wide)}>
            <div className={styles.header}>
              <span aria-hidden={numberHidden} className={styles.number}>
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
