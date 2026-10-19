import type { ShowcaseCard } from "#features/case-studies/case-studies.types.ts";

export interface ShowcaseRowProps {
  item: ShowcaseCard;
  /** Full screenshot (opened in the viewer). */
  src: string;
  /** Optional close-up for the card. */
  previewSrc?: string;
  /** Opens the full-size viewer. */
  onExpand?: (trigger: HTMLElement) => void;
}
