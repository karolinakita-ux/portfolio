import type { HTMLAttributes, ReactNode } from "react";

/**
 * stack: content in a column (text cards). media: an image beside its text from md (case cards, screenshots).
 * rows: looks like stack, but its parts sit in rows shared with the cards beside it (a Carousel with `rows`), so
 * their lines stay level whatever wraps; the caller places each part in its row.
 */
export type CardLayout = "stack" | "media" | "rows";
export type CardGap = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "li" | "figure" | "div";
  layout?: CardLayout;
  gap?: CardGap;
  /** Fade up on scroll (default). Off for cards that close a case study, which stay still. */
  reveal?: boolean;
  children: ReactNode;
}
