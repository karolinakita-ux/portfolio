import { styles } from "./InfoTableCell.styles.ts";
import type { InfoTableCellProps } from "./InfoTableCell.types.ts";

/** One label/value cell of an InfoTable. */
export function InfoTableCell({ label, children }: InfoTableCellProps) {
  return (
    <div className={styles.root}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}
