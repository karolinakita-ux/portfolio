import { card } from "./Card.styles.ts";
import type { CardProps } from "./Card.types.ts";

/** A content card. `className` adds layout only (grid columns, full height), never colours or spacing. */
export function Card({ as: Element = "article", layout, gap, className, children, ...props }: CardProps) {
  return (
    <Element className={card({ layout, gap, className })} {...props}>
      {children}
    </Element>
  );
}
