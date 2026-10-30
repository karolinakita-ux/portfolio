import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseSummary.styles.ts";
import type { CaseSummaryProps } from "./CaseSummary.types.ts";

/**
 * Figma: Executive summary, shared by every case study. H2, an optional one-line lead (Headline Small),
 * then titled columns ("The problem", "My part"): stacked below lg, side by side from lg. Columns without titles
 * read as plain paragraphs in a single column (Automotive's "Overview & Problem").
 */
export function CaseSummary({ c }: CaseSummaryProps) {
  const titled = c.summary.some((column) => column.title);
  return (
    <Section id={c.id + "-summary"} title={c.summaryTitle}>
      {c.summaryLead ? <p className={styles.lead}>{c.summaryLead}</p> : null}
      <div className={styles.columns(titled)}>
        {c.summary.map((column) => (
          <div key={column.title ?? column.body} className={styles.column}>
            {column.title ? <h3 className={styles.title}>{column.title}</h3> : null}{" "}
            <p className={styles.body}>{column.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
