import { useMemo } from "react";

import type { CaseViewProps, SmartTicketCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { CaseImpact } from "#features/case-studies/components/CaseImpact/CaseImpact.tsx";
import { CaseIntro } from "#features/case-studies/components/CaseIntro/CaseIntro.tsx";
import { CaseNav } from "#features/case-studies/components/CaseNav/CaseNav.tsx";
import { CaseSummary } from "#features/case-studies/components/CaseSummary/CaseSummary.tsx";
import { ComparisonBlock } from "#features/case-studies/components/ComparisonBlock/ComparisonBlock.tsx";
import { DesignFilesBanner } from "#features/case-studies/components/DesignFilesBanner/DesignFilesBanner.tsx";
import { DetailList } from "#features/case-studies/components/DetailList/DetailList.tsx";
import { PersonaCard } from "#features/case-studies/components/PersonaCard/PersonaCard.tsx";
import { ScreenGrid } from "#features/case-studies/components/ScreenGrid/ScreenGrid.tsx";
import { ShowcaseRows } from "#features/case-studies/components/ShowcaseRows/ShowcaseRows.tsx";
import { smartTicketCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { useCaseGallery } from "#features/case-studies/gallery/useCaseGallery.ts";
import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./CaseSmartTicketView.styles.ts";
import { galleryBlocks } from "./CaseSmartTicketView.utils.ts";

/**
 * Smart Ticket: intro → summary → personas → user flow → design system rows → 2022 vs 2026 comparisons →
 * passenger app rows → operations console → outcomes → lessons → design files banner → prev/next.
 * Same building blocks, type scale and spacing as the other case studies; every image opens the case gallery.
 */
export function CaseSmartTicketView({ c, resolveAsset, onNavigate }: CaseViewProps<SmartTicketCaseStudy>) {
  const cards = useMemo(() => smartTicketCards(c), [c]);
  const rows = useCaseGallery(cards, resolveAsset, c.view);
  const blocks = galleryBlocks(c, rows);

  return (
    <>
      <CaseIntro c={c} onNavigate={onNavigate} />
      <CaseSummary c={c} />

      <Section id={c.personas.id} eyebrow={c.personas.eyebrow} title={c.personas.title} description={c.personas.lead}>
        <ul className={styles.personas}>
          {c.personas.personas.map((persona) => (
            <li key={persona.id} className={styles.persona}>
              <PersonaCard persona={persona} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id={c.flow.id} eyebrow={c.flow.eyebrow} title={c.flow.title} description={c.flow.lead}>
        {blocks.flow && (
          <Screenshot
            src={blocks.flow.src}
            darkSrc={blocks.flow.darkSrc}
            alt={blocks.flow.card.alt}
            onExpand={blocks.flow.onExpand}
            frameless={blocks.flow.card.frameless}
          />
        )}
      </Section>

      <Section id={c.system.id} eyebrow={c.system.eyebrow} title={c.system.title} description={c.system.lead}>
        <ul className={styles.rows}>
          <ShowcaseRows rows={blocks.system} />
        </ul>
      </Section>

      <Section id={c.rebuild.id} eyebrow={c.rebuild.eyebrow} title={c.rebuild.title} description={c.rebuild.lead}>
        <div className={styles.comparisons}>
          {c.rebuild.comparisons.map((comparison, index) => (
            <ComparisonBlock
              key={comparison.id}
              comparison={comparison}
              beforeRows={blocks.comparisons[index]?.before ?? []}
              afterRows={blocks.comparisons[index]?.after ?? []}
            />
          ))}
        </div>
      </Section>

      <Section
        id={c.passenger.id}
        eyebrow={c.passenger.eyebrow}
        title={c.passenger.title}
        description={c.passenger.lead}
      >
        <ul className={styles.rows}>
          <ShowcaseRows rows={blocks.passenger} />
        </ul>
      </Section>

      <ScreenGrid section={c.operations} rows={blocks.operations} />

      <CaseImpact impact={c.impact} />

      <Section id={c.lessons.id} eyebrow={c.lessons.eyebrow} title={c.lessons.title}>
        <DetailList items={c.lessons.points} />
      </Section>

      {c.designFile && <DesignFilesBanner file={c.designFile} caseView={c.view} />}

      <CaseNav from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />
    </>
  );
}
