import { styles } from "./Container.styles.ts";
import type { ContainerProps } from "./Container.types.ts";

/** Page gutter + centred 1120px content column. */
export function Container({ className, children }: ContainerProps) {
  return (
    <div className={styles.root(className)}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}
