import type { ShowcaseCard } from "#features/case-studies/case-studies.types.ts";

export interface ShowcaseRowProps {
  item: ShowcaseCard;
  /** Full screenshot (opened in the viewer). */
  src: string;
  /** Dark-mode version of `src`. */
  darkSrc?: string;
  /** Optional close-up for the card. */
  previewSrc?: string;
  /** Opens the full-size viewer. */
  onExpand?: (trigger: HTMLElement) => void;
  /** Screenshot on the left from lg (every other row). */
  reverse?: boolean;
}
