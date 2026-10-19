import { styles } from "./InfoPanel.styles.ts";
import type { InfoPanelProps } from "./InfoPanel.types.ts";

/** Two-cell label/value panel; cells stack with a hairline below lg. */
export function InfoPanel({ children }: InfoPanelProps) {
  return <dl className={styles.root}>{children}</dl>;
}
