import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseImpact.styles.ts";
import type { CaseImpactProps } from "./CaseImpact.types.ts";

/**
 * Figma: Outcomes & impact. Eyebrow and H2, a row of stat cards (the figure in Zilla Slab, the sentence that
 * explains it below), an optional note on what the figures are, then optional bullets. Cards stack below md;
 * from md two or four cards sit two in a row, any other count three in a row. A stat card has no heading, so the
 * figure is its title for visitor statistics (`data-card-title`, shared/lib/analytics).
 */
export function CaseImpact({ impact }: CaseImpactProps) {
  return (
    <Section id={impact.id} eyebrow={impact.eyebrow} title={impact.title}>
      <ul className={styles.stats(impact.stats.length)}>
        {impact.stats.map((stat) => (
          <li key={stat.value} className={styles.statItem}>
            <Card as="div" gap="md" className={styles.card}>
              <p data-card-title="" className={styles.value}>
                {stat.value}
              </p>{" "}
              <p className={styles.label}>{stat.label}</p>
            </Card>
          </li>
        ))}
      </ul>
      {impact.note ? <p className={styles.note}>{impact.note}</p> : null}
      {impact.bullets && (
        <ul className={BULLET_LIST}>
          {impact.bullets.map((bullet, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      )}
    </Section>
  );
}
