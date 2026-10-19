import type { ReactNode } from "react";

export type BadgeWeight = "regular" | "medium";

export interface BadgeProps {
  /** "li" when the badges form a list (skill tags). */
  as?: "span" | "li";
  weight?: BadgeWeight;
  children: ReactNode;
}
