import type { ReactNode } from "react";

export interface CvSectionProps {
  id: string;
  title: string;
  /** Keep the whole section on one printed page. */
  keepTogether?: boolean;
  children: ReactNode;
}
