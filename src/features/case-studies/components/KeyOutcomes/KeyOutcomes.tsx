import { styles } from "./KeyOutcomes.styles.ts";
import type { KeyOutcomesProps } from "./KeyOutcomes.types.ts";

/**
 * Key outcomes closing a case-study section (`section.highlights`). Follows the
 * flat editorial LAYOUT RULE of DetailList (no cards, boxes or borders), laid out as a
 * grid: 1 column on mobile, 3 from md. 24px extra space separates it from the cards.
 */
export function KeyOutcomes({ items, labelId }: KeyOutcomesProps) {
  return (
    <div className={styles.root}>
      <h3 id={labelId} className={styles.heading}>
        Key Outcomes
      </h3>
      <ul aria-labelledby={labelId} className={styles.list}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <h4 className={styles.title}>{item.title}</h4>
            <p className={styles.body}>{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
