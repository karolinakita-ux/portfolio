import { useId, useState } from "react";

import { ChevronDown } from "#shared/ui/icons/icons.tsx";

import { styles } from "./AccordionItem.styles.ts";
import type { AccordionItemProps } from "./AccordionItem.types.ts";

/**
 * Accordion item (WAI-ARIA pattern): heading > button[aria-expanded] controlling a labelled
 * region. Collapsed by default. The collapsed panel is `inert`, so hidden content is skipped
 * by keyboard and screen readers.
 */
export function AccordionItem({ title, onOpen, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const buttonId = baseId + "-q";
  const panelId = baseId + "-a";

  return (
    <li className={styles.root}>
      <h3 className={styles.heading}>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (!open) onOpen?.();
            setOpen(!open);
          }}
          className={styles.button}
        >
          <span className={styles.title}>{title}</span>
          <ChevronDown aria-hidden="true" size={20} className={styles.chevron(open)} />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} inert={!open} className={styles.panel(open)}>
        <div className={styles.clip}>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </li>
  );
}
