import { badge } from "./Badge.styles.ts";
import type { BadgeProps } from "./Badge.types.ts";

/** A small label pill: a skill tag, or a status next to a title. */
export function Badge({ as: Element = "span", weight, children }: BadgeProps) {
  return <Element className={badge({ weight })}>{children}</Element>;
}
