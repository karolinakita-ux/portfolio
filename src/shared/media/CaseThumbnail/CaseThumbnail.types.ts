export interface CaseThumbnailProps {
  src: string;
  /** Dark-mode version of `src`; without one (or when it fails), Dark mode shows `src`. */
  darkSrc?: string;
  alt: string;
  /** Hover feedback (border, slight zoom) when an ancestor with `group/thumb` is hovered. */
  interactive?: boolean;
}
