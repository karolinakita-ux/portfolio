import { CaseCard } from "#features/work/components/CaseCard/CaseCard.tsx";
import { HeroSection } from "#features/work/components/HeroSection/HeroSection.tsx";
import { ProcessBanner } from "#features/work/components/ProcessBanner/ProcessBanner.tsx";
import { TestimonialsSection } from "#features/work/components/TestimonialsSection/TestimonialsSection.tsx";
import { WORK_CASES, WORK_INTRO } from "#features/work/work.content.ts";
import { SECTION } from "#shared/lib/routes/routes.constants.ts";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./WorkView.styles.ts";
import type { WorkViewProps } from "./WorkView.types.ts";

/** Work (default view): hero → featured case studies → leadership endorsements. */
export function WorkView({ resolveAsset, onNavigate }: WorkViewProps) {
  // Rhythm: hero → 64px → heading → 8px → lead-in → 24px → NDA note → 24px → cards
  return (
    <>
      <HeroSection onNavigate={onNavigate} />
      <Section
        id={SECTION.workCases}
        title="Selected Work & Case Studies"
        description={WORK_INTRO}
        headingProps={{ tabIndex: -1 }}
      >
        <Callout tone="warning" label="Confidentiality note">
          Due to confidentiality and <strong className={styles.emphasis}>NDAs</strong>, client names, product names and
          sensitive business data in the case studies have been anonymized. In-depth walkthroughs of proprietary flows
          are available during interviews.
        </Callout>
        <ul className={styles.cases}>
          {WORK_CASES.map((item) => (
            <li key={item.id}>
              <CaseCard item={item} resolveAsset={resolveAsset} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
        <ProcessBanner />
      </Section>
      <TestimonialsSection />
    </>
  );
}
