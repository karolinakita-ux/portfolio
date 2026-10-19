import { useMemo } from "react";

import type { CaseStudy, CaseViewProps } from "#features/case-studies/case-studies.types.ts";
import { CaseIntro } from "#features/case-studies/components/CaseIntro/CaseIntro.tsx";
import { CaseNav } from "#features/case-studies/components/CaseNav/CaseNav.tsx";
import { CaseSummary } from "#features/case-studies/components/CaseSummary/CaseSummary.tsx";
import { DetailList } from "#features/case-studies/components/DetailList/DetailList.tsx";
import { KeyOutcomes } from "#features/case-studies/components/KeyOutcomes/KeyOutcomes.tsx";
import { ShowcaseRows } from "#features/case-studies/components/ShowcaseRows/ShowcaseRows.tsx";
import { caseCards, sectionStarts } from "#features/case-studies/gallery/gallery.utils.ts";
import { useCaseGallery } from "#features/case-studies/gallery/useCaseGallery.ts";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseStudyView.styles.ts";

/**
 * Shared case-study layout (Project Planning, Automotive):
 * intro → summary → screenshot sections (optional key-outcomes grid) → optional outcomes / reflections → prev/next.
 */
export function CaseStudyView({ c, resolveAsset, onNavigate }: CaseViewProps<CaseStudy>) {
  const cards = useMemo(() => caseCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset, c.view);
  // Start index of each section's cards in the shared gallery.
  const starts = useMemo(() => sectionStarts(c), [c]);

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      {c.sections.map((section, index) => {
        const start = starts[index] ?? 0;
        return (
          <Section key={section.id} id={section.id} title={section.title} description={section.intro}>
            <ul className={styles.rows}>
              <ShowcaseRows rows={rows.slice(start, start + section.cards.length)} />
            </ul>
            {section.highlights && <KeyOutcomes items={section.highlights} labelId={section.id + "-outcomes"} />}
          </Section>
        );
      })}

      {c.outcomes && (
        <Section
          id={c.id + "-outcomes"}
          title={c.outcomesTitle ?? "Outcomes & Business Impact"}
          description={c.outcomesIntro}
        >
          <DetailList items={c.outcomes} />
        </Section>
      )}

      {c.reflections && (
        <Section id={c.id + "-reflections"} title={c.reflections.title} description={c.reflections.intro}>
          <DetailList items={c.reflections.points.map(([title, body]) => ({ title, body }))} />
        </Section>
      )}

      <CaseNav from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}
