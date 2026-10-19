import { styles } from "./VisuallyHidden.styles.ts";
import type { VisuallyHiddenProps } from "./VisuallyHidden.types.ts";

/** Text for screen readers only: off screen, still read out and copied. */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className={styles.root}>{children}</span>;
}
