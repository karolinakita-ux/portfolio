import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { AccordionItem } from "#shared/ui/AccordionItem/AccordionItem.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { styles } from "./FaqItem.styles.ts";
import type { FaqItemProps } from "./FaqItem.types.ts";

/** One FAQ question as an accordion item; opening it is counted (faq-open). */
export function FaqItem({ item }: FaqItemProps) {
  return (
    <AccordionItem title={item.question} onOpen={() => track(EVENT.faqOpen, { question: item.id })}>
      <p className={styles.answer}>{item.answer}</p>
      {item.points && (
        <ul className={BULLET_LIST}>
          {item.points.map(([term, text]) => (
            <li key={term}>{lead(term, text)}</li>
          ))}
        </ul>
      )}
    </AccordionItem>
  );
}
