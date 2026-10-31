import { ACCESSIBILITY } from "#features/accessibility/accessibility.content.tsx";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";
import { ProseSection } from "#shared/ui/ProseSection/ProseSection.tsx";

import { styles } from "./AccessibilityView.styles.ts";
import type { AccessibilityViewProps } from "./AccessibilityView.types.ts";

/** Accessibility statement: what the site supports, its known limits, how it is checked and how to report a problem. */
export function AccessibilityView({ onNavigate }: AccessibilityViewProps) {
  return (
    <>
      <section aria-labelledby="accessibility-title" className={styles.hero}>
        <Container>
          <Breadcrumb onNavigate={onNavigate} items={[HOME_CRUMB, { label: ACCESSIBILITY.title }]} />
          <div className={styles.heading}>
            <Eyebrow parts={[ACCESSIBILITY.eyebrow]} />
            <PageTitle id="accessibility-title">{ACCESSIBILITY.title}</PageTitle>
            <p className={styles.intro}>{ACCESSIBILITY.intro}</p>
            <p className={styles.updated}>
              Last updated: <time dateTime={ACCESSIBILITY.updated.iso}>{ACCESSIBILITY.updated.label}</time>
            </p>
          </div>
        </Container>
      </section>

      {ACCESSIBILITY.sections.map((section) => (
        <ProseSection key={section.id} section={section} />
      ))}
    </>
  );
}
