import { MilestoneCard } from "#features/about/components/MilestoneCard/MilestoneCard.tsx";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { ArrowRight } from "#shared/ui/icons/icons.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { MILESTONES_NEWEST_FIRST } from "./CareerSection.constants.ts";
import { styles } from "./CareerSection.styles.ts";
import type { CareerSectionProps } from "./CareerSection.types.ts";

export function CareerSection({ onNavigate }: CareerSectionProps) {
  return (
    <Section id="career" title="Career Progression" description="2015 - Present">
      <ol className={styles.list}>
        {MILESTONES_NEWEST_FIRST.map((milestone) => (
          <li key={milestone.id}>
            <MilestoneCard milestone={milestone} />
          </li>
        ))}
      </ol>
      {/* Reading path to the work for visitors who skipped the top navigation */}
      <div className={styles.actions}>
        <Button
          as="a"
          href={hrefForView(VIEW.work, SECTION.workCases)}
          iconRight={ArrowRight}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(VIEW.work, SECTION.workCases);
          }}
        >
          Explore Enterprise Case Studies
        </Button>
      </div>
    </Section>
  );
}
