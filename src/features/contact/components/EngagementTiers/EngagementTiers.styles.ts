import type { Engagement } from "#features/contact/contact.types.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

/**
 * Primary: bgAccentBrandSubtle pill + textPrimary, gold dot marker.
 * Selective: bgSurfaceDefault + borderSubtle + textSecondary - deliberately quieter.
 */
const TIER_PILL: Record<Engagement["tier"], string> = {
  primary: cn("bg-bg-accent-brand-subtle text-text-primary"),
  selective: cn("border border-border-subtle bg-bg-surface-default text-text-secondary"),
};

export const styles = {
  list: cn("flex flex-col gap-lg"),
  item: cn("flex flex-col items-start gap-xs"),
  /** Pills round fully from sm up; below that a label may wrap, so radiusMd keeps it tidy. */
  pill: (tier: Engagement["tier"]) =>
    cn("inline-flex items-center gap-xs rounded-md px-sm py-2xs text-label-lg sm:rounded-full", TIER_PILL[tier]),
  dot: cn("size-xs shrink-0 rounded-full bg-bg-accent-brand"),
  body: cn("text-body-md text-text-secondary"),
};
