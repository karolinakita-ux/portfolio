import { styles } from "./Accordion.styles.ts";
import type { AccordionProps } from "./Accordion.types.ts";

/** A list of AccordionItems; each opens on its own. */
export function Accordion({ children }: AccordionProps) {
  return <ul className={styles.root}>{children}</ul>;
}
