import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { Engagement } from "#features/contact/contact.types.ts";

/**
 * Primary: bgAccentBrandSubtle pill + textPrimary, gold dot marker.
 * Selective: bgSurfaceDefault + borderSubtle + textSecondary - deliberately quieter.
 */
const TIER: Record<Engagement["tier"], string> = {
  primary: "bg-bg-accent-brand-subtle text-text-primary",
  selective: "border border-border-subtle bg-bg-surface-default text-text-secondary",
};

/** Pills round fully from sm up; below that a label may wrap, so radiusMd keeps it tidy. */
export const tierPill = cva("inline-flex items-center gap-xs rounded-md px-sm py-2xs text-label-lg sm:rounded-full", {
  variants: { tier: TIER },
});

export const styles = {
  list: clsx("flex flex-col gap-lg"),
  item: clsx("flex flex-col items-start gap-xs"),
  dot: clsx("size-xs shrink-0 rounded-full bg-bg-accent-brand"),
  body: clsx("text-body-md text-text-secondary"),
};
