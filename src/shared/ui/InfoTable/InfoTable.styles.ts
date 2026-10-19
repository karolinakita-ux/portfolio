import { cva } from "class-variance-authority";

import type { InfoTableColumns } from "./InfoTable.types.ts";

const COLUMNS: Record<InfoTableColumns, string> = {
  1: "",
  2: "lg:grid-cols-2 lg:divide-x lg:divide-y-0",
};

/** Figma: Info Table. Label/value cells on a raised panel, a hairline between them. */
export const infoTable = cva(
  "grid divide-y divide-border-subtle rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm",
  { variants: { columns: COLUMNS }, defaultVariants: { columns: 2 } },
);
