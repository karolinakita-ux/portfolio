import { card } from "./Card.styles.ts";
import type { CardProps } from "./Card.types.ts";

/**
 * A content card. `className` adds layout only (grid columns, full height), never colours or spacing.
 * `data-card` lets visitor statistics name a click on a card that does nothing (shared/lib/analytics).
 */
export function Card({ as: Element = "article", layout, gap, reveal, className, children, ...props }: CardProps) {
  return (
    <Element data-card="" className={card({ layout, gap, reveal, className })} {...props}>
      {children}
    </Element>
  );
}
