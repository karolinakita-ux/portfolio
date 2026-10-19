import { PRINCIPLES } from "#features/about/about.content.ts";
import { PortraitCard } from "#features/about/components/PortraitCard/PortraitCard.tsx";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./PhilosophySection.styles.ts";
import type { PhilosophySectionProps } from "./PhilosophySection.types.ts";

export function PhilosophySection({ portraitSrc }: PhilosophySectionProps) {
  return (
    <Section
      id="philosophy"
      title="How I Like to Work"
      description="Good software should make work easier, not harder. Here are a few simple principles I follow on every project:"
      bodyGap="xl"
    >
      <div className={styles.grid}>
        <ul className={styles.list}>
          {PRINCIPLES.map((principle) => (
            <Card as="li" key={principle.id}>
              <h3 className={styles.title}>{principle.title}</h3>
              <p className={styles.body}>{principle.body}</p>
            </Card>
          ))}
        </ul>
        <PortraitCard src={portraitSrc} />
      </div>
    </Section>
  );
}
