import type { ReactNode } from "react";

export type BadgeWeight = "regular" | "medium";

export type BadgeTone = "neutral" | "error" | "success" | "warning";

export interface BadgeProps {
  /** "li" when the badges form a list (skill tags). */
  as?: "span" | "li";
  weight?: BadgeWeight;
  /** neutral (default): a tag; error / success: a measured result in a before / after comparison; warning: planned, not shipped yet. */
  tone?: BadgeTone;
  children: ReactNode;
}
