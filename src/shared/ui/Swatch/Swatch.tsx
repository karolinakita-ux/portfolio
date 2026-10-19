import { styles } from "./Swatch.styles.ts";
import type { SwatchProps } from "./Swatch.types.ts";

/** Inline colour chip for hex values quoted in copy (content data, not UI chrome). */
export function Swatch({ hex }: SwatchProps) {
  return <span aria-hidden="true" className={styles.root} style={{ backgroundColor: hex }} />;
}
