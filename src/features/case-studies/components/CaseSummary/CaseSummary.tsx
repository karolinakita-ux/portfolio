import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseSummary.styles.ts";
import type { CaseSummaryProps } from "./CaseSummary.types.ts";

export function CaseSummary({ c }: CaseSummaryProps) {
  return (
    <Section id={c.id + "-summary"} title={c.summaryTitle}>
      <div className={styles.body}>
        {c.summary.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </Section>
  );
}
