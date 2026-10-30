import { useMemo } from "react";

import type { CaseStudy, CaseViewProps } from "#features/case-studies/case-studies.types.ts";
import { CaseImpact } from "#features/case-studies/components/CaseImpact/CaseImpact.tsx";
import { CaseIntro } from "#features/case-studies/components/CaseIntro/CaseIntro.tsx";
import { CaseNav } from "#features/case-studies/components/CaseNav/CaseNav.tsx";
import { CaseSummary } from "#features/case-studies/components/CaseSummary/CaseSummary.tsx";
import { DesignFilesBanner } from "#features/case-studies/components/DesignFilesBanner/DesignFilesBanner.tsx";
import { DetailList } from "#features/case-studies/components/DetailList/DetailList.tsx";
import { FeatureSection } from "#features/case-studies/components/FeatureSection/FeatureSection.tsx";
import { NumberedCards } from "#features/case-studies/components/NumberedCards/NumberedCards.tsx";
import { ShowcaseRows } from "#features/case-studies/components/ShowcaseRows/ShowcaseRows.tsx";
import { caseCards, featureStarts, sectionStarts } from "#features/case-studies/gallery/gallery.utils.ts";
import { useCaseGallery } from "#features/case-studies/gallery/useCaseGallery.ts";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseStudyView.styles.ts";

/**
 * Shared case-study layout (Project Planning, Automotive):
 * intro → summary → feature sections → screenshot sections → optional impact, outcomes and reflections →
 * optional design files banner → prev/next.
 */
export function CaseStudyView({ c, resolveAsset, onNavigate }: CaseViewProps<CaseStudy>) {
  const cards = useMemo(() => caseCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset, c.view);
  // Start index of each block's images in the shared gallery.
  const featureStart = useMemo(() => featureStarts(c), [c]);
  const sectionStart = useMemo(() => sectionStarts(c), [c]);
  const reflectionItems = c.reflections?.points.map(([title, body]) => ({ title, body })) ?? [];
  const numberedReflections = c.reflections?.layout === "numbered";

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      {c.features?.map((feature, index) => {
        const start = featureStart[index] ?? 0;
        return (
          <FeatureSection
            key={feature.id}
            section={feature}
            rows={rows.slice(start, start + feature.media.length)}
            reverse={index % 2 === 1}
          />
        );
      })}

      {c.sections.map((section, index) => {
        const start = sectionStart[index] ?? 0;
        return (
          <Section key={section.id} id={section.id} title={section.title} description={section.intro}>
            <ul className={styles.rows}>
              <ShowcaseRows rows={rows.slice(start, start + section.cards.length)} />
            </ul>
          </Section>
        );
      })}

      {c.impact && <CaseImpact impact={c.impact} />}

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
          {numberedReflections ? <NumberedCards items={reflectionItems} /> : <DetailList items={reflectionItems} />}
        </Section>
      )}

      {c.designFile && <DesignFilesBanner file={c.designFile} caseView={c.view} />}

      <CaseNav from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}
