import { styles } from "./InfoCell.styles.ts";
import type { InfoCellProps } from "./InfoCell.types.ts";

/** One label/value cell of an InfoPanel. */
export function InfoCell({ label, children }: InfoCellProps) {
  return (
    <div className={styles.root}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}
