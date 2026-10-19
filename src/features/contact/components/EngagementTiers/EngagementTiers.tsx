import { styles, tierPill } from "./EngagementTiers.styles.ts";
import type { EngagementTiersProps } from "./EngagementTiers.types.ts";

/** Engagement tiers - primary vs selective. */
export function EngagementTiers({ items }: EngagementTiersProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.tier} className={styles.item}>
          <span className={tierPill({ tier: item.tier })}>
            {item.tier === "primary" && <span aria-hidden="true" className={styles.dot} />}
            {item.label}
          </span>
          <p className={styles.body}>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
