import { styles } from "./NumberedCards.styles.ts";
import type { NumberedCardsProps } from "./NumberedCards.types.ts";

/**
 * Numbered takeaway cards ("01", "02", "03") closing a case study: an ordered list of info-tinted cards,
 * one column on phones, two or three side by side from md. They close the page, so they stay still: no scroll
 * reveal after the impact (docs/motion.md, Scroll reveal). The opt-in alternative to DetailList's flat layout
 * (`reflections.layout: "numbered"`). `data-card`: visitor statistics name a click on a card that does nothing
 * by its title (shared/lib/analytics).
 */
export function NumberedCards({ items }: NumberedCardsProps) {
  return (
    <ol className={styles.list(items.length)}>
      {items.map((item, index) => (
        <li key={item.title} data-card="" className={styles.item}>
          <span aria-hidden="true" className={styles.number}>
            {String(index + 1).padStart(2, "0")}
          </span>{" "}
          <h3 className={styles.title}>{item.title}</h3> <p className={styles.body}>{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
