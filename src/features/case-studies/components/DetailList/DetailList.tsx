import { Badge } from "#shared/ui/Badge/Badge.tsx";

import { styles } from "./DetailList.styles.ts";
import type { DetailListProps } from "./DetailList.types.ts";

/**
 * LAYOUT RULE - closing / impact / reflection sections in every case study.
 * Flat editorial flow: no cards, boxes, borders or list markers.
 *   Section H2 → optional lead (Body Large) → items:
 *   Title Medium, semibold, own line → Body Large description; 24px between items.
 */
export function DetailList({ items }: DetailListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.title} className={styles.item}>
          <h3 className={styles.title}>
            {item.title} {item.badge && <Badge weight="medium">{item.badge}</Badge>}
          </h3>
          <p className={styles.body}>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
