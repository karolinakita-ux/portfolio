import { useId, useState } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { ChevronDown } from "#shared/ui/icons/icons.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { styles } from "./FaqItem.styles.ts";
import type { FaqItemProps } from "./FaqItem.types.ts";

/**
 * Accordion item (WAI-ARIA pattern): heading > button[aria-expanded] controlling
 * a labelled region. Collapsed by default; items open independently.
 * Height animates via grid-template-rows 0fr → 1fr (no measured heights).
 * The collapsed panel is `inert`, so hidden content is skipped by keyboard
 * and screen readers. Opening a question is counted (faq-open).
 */
export function FaqItem({ item }: FaqItemProps) {
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
            if (!open) track(EVENT.faqOpen, { question: item.id });
            setOpen(!open);
          }}
          className={styles.question}
        >
          <span className={styles.questionText}>{item.question}</span>
          <ChevronDown aria-hidden="true" size={20} className={styles.chevron(open)} />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} inert={!open} className={styles.panel(open)}>
        <div className={styles.clip}>
          <div className={styles.answer}>
            <p className={styles.answerText}>{item.answer}</p>
            {item.points && (
              <ul className={BULLET_LIST}>
                {item.points.map(([term, text]) => (
                  <li key={term}>{lead(term, text)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
