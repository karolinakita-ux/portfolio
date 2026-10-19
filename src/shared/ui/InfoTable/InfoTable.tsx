import { infoTable } from "./InfoTable.styles.ts";
import type { InfoTableProps } from "./InfoTable.types.ts";

/** Label/value panel (a <dl>); cells stack with a hairline, two side by side from lg by default. */
export function InfoTable({ columns, children }: InfoTableProps) {
  return <dl className={infoTable({ columns })}>{children}</dl>;
}
