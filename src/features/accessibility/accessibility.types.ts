import type { ProseSectionContent } from "#shared/ui/ProseSection/ProseSection.types.ts";

/** Section ids: the URL hashes of the accessibility statement (/accessibility#feedback). Keep them stable. */
export type AccessibilitySectionId = "in-short" | "what-you-can-do" | "known-limits" | "how-i-check-it" | "feedback";

export interface AccessibilitySection extends ProseSectionContent {
  id: AccessibilitySectionId;
}

export interface AccessibilityContent {
  eyebrow: string;
  title: string;
  intro: string;
  /** When the statement was last reviewed. */
  updated: { iso: string; label: string };
  sections: readonly AccessibilitySection[];
}
