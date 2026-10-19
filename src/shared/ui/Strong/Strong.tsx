import { styles } from "./Strong.styles.ts";
import type { StrongProps } from "./Strong.types.ts";

/** Bold lead-in or emphasis in copy (case-study bullets open with one: see lead()). */
export function Strong({ children }: StrongProps) {
  return <strong className={styles.root}>{children}</strong>;
}
