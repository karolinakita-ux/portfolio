import { badge } from "./Badge.styles.ts";
import type { BadgeProps } from "./Badge.types.ts";

/** A small label pill: a skill tag, a status next to a title, or a measured result (error / success tone). */
export function Badge({ as: Element = "span", weight, tone, children }: BadgeProps) {
  return <Element className={badge({ weight, tone })}>{children}</Element>;
}
