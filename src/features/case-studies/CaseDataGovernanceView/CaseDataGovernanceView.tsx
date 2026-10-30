import { useMemo } from "react";

import type { CaseViewProps, DataGovernanceCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { BentoCards } from "#features/case-studies/components/BentoCards/BentoCards.tsx";
import { CaseIntro } from "#features/case-studies/components/CaseIntro/CaseIntro.tsx";
import { CaseNav } from "#features/case-studies/components/CaseNav/CaseNav.tsx";
import { CaseSummary } from "#features/case-studies/components/CaseSummary/CaseSummary.tsx";
import { DesignFilesBanner } from "#features/case-studies/components/DesignFilesBanner/DesignFilesBanner.tsx";
import { NumberedCards } from "#features/case-studies/components/NumberedCards/NumberedCards.tsx";
import { ShowcaseRows } from "#features/case-studies/components/ShowcaseRows/ShowcaseRows.tsx";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { useCaseGallery } from "#features/case-studies/gallery/useCaseGallery.ts";
import { Card } from "#shared/ui/Card/Card.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseDataGovernanceView.styles.ts";

/** Enterprise White-Label Theme Generator: problem cards, solution and safety rows, delivery, handoff, takeaways. */
export function CaseDataGovernanceView({ c, resolveAsset, onNavigate }: CaseViewProps<DataGovernanceCaseStudy>) {
  const cards = useMemo(() => caseCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset, c.view);
  const solutionRows = rows.slice(0, c.solution.length);
  const safetyRows = rows.slice(c.solution.length);

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      <Section id="case-problem" title="The Core Problem: Management Assumption vs. Usability Reality">
        <div className={styles.problemGrid}>
          <Card>
            <h3 className={styles.problemTitle}>The Assumption</h3>
            <p className={styles.problemBody}>{c.assumption}</p>
          </Card>
          <Card>
            <h3 className={styles.problemTitle}>The Reality</h3>
            <ul className={styles.problemList}>
              {c.reality.map((point, index) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- static content in fixed order
                <li key={index}>{point}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        id="case-solution"
        title="The Solution: Governed White-Label Theming & Accessibility"
        description={c.solutionIntro}
      >
        <ol className={styles.rows}>
          <ShowcaseRows rows={solutionRows} />
        </ol>
      </Section>

      <Section id="case-safety" title="Error Prevention & Deployment Safeguards" description={c.safetyIntro}>
        <ul className={styles.rows}>
          <ShowcaseRows rows={safetyRows} />
        </ul>
      </Section>

      <Section id="case-delivery" title="MVP Delivery & Phased Roadmap" description={c.deliveryIntro}>
        <BentoCards items={c.delivery} />
      </Section>

      <Section
        id="case-engineering"
        title="Developer Handoff & Technical Collaboration"
        description={c.engineeringIntro}
      >
        <BentoCards items={c.engineering} start={c.delivery.length + 1} columns={2} />
      </Section>

      <Section id="case-takeaways" title="Key Takeaways & Retrospective">
        <NumberedCards items={c.takeaways} />
      </Section>

      {c.designFile && <DesignFilesBanner file={c.designFile} caseView={c.view} />}

      <CaseNav from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}
