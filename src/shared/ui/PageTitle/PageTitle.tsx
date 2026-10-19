import { styles } from "./PageTitle.styles.ts";
import type { PageTitleProps } from "./PageTitle.types.ts";

/** The page's H1. Keep it short (it should fit one line on desktop) and without a trailing period. */
export function PageTitle({ id, children }: PageTitleProps) {
  return (
    <h1 id={id} className={styles.root}>
      {children}
    </h1>
  );
}
