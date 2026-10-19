import type { ReactNode } from "react";

export interface PageTitleProps {
  /** The section that the title labels points at it (aria-labelledby). */
  id: string;
  children: ReactNode;
}
