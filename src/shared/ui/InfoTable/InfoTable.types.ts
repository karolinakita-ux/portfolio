import type { ReactNode } from "react";

/** 2: two cells side by side from lg (contact details). 1: one cell per row (a list of entries). */
export type InfoTableColumns = 1 | 2;

export interface InfoTableProps {
  columns?: InfoTableColumns;
  /** InfoTableCell elements. */
  children: ReactNode;
}
