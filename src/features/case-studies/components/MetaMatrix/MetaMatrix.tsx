import { styles } from "./MetaMatrix.styles.ts";
import type { MetaMatrixProps } from "./MetaMatrix.types.ts";

/**
 * Case-study details panel. Up to 4 cells sit in one row on desktop; an entry
 * flagged `wide` spans the full width as a second row (e.g. Key Outcome when a
 * Team cell is present). Dividers are per-cell borders so both layouts share the
 * same 1px border-subtle rules: stacked rows on mobile, columns + row on lg.
 */
export function MetaMatrix({ entries }: MetaMatrixProps) {
  return (
    <dl className={styles.root}>
      {entries.map((entry, index) => (
        <div key={entry.label} className={styles.cell(index, entry.wide === true)}>
          <dt className={styles.term}>{entry.label}</dt>
          <dd className={styles.value}>{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}
