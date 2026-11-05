import type { ReactNode } from "react";

export interface PageTitleProps {
  /** Its id: the section it titles points at it with `aria-labelledby`. */
  id: string;
  children: ReactNode;
}
