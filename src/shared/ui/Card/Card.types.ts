import type { HTMLAttributes, ReactNode } from "react";

/** stack: content in a column (text cards). media: an image beside its text from md (case cards, screenshots). */
export type CardLayout = "stack" | "media";
export type CardGap = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "li" | "figure" | "div";
  layout?: CardLayout;
  gap?: CardGap;
  children: ReactNode;
}
