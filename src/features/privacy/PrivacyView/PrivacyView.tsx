import type { ReactNode } from "react";

import { PrivacySectionView } from "#features/privacy/components/PrivacySectionView/PrivacySectionView.tsx";
import { RecipientsTable } from "#features/privacy/components/RecipientsTable/RecipientsTable.tsx";
import { StatisticsSwitch } from "#features/privacy/components/StatisticsSwitch/StatisticsSwitch.tsx";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import type { PrivacySectionId } from "#features/privacy/privacy.types.ts";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";

import { styles } from "./PrivacyView.styles.ts";
import type { PrivacyViewProps } from "./PrivacyView.types.ts";

/** The parts of the policy that are more than text. */
const EXTRAS: Partial<Record<PrivacySectionId, ReactNode>> = {
  statistics: <StatisticsSwitch />,
  recipients: <RecipientsTable />,
  rights: (
    // GDPR Art. 21(4): the right to object is shown clearly and separately from the other rights.
    <Callout tone="info" label={PRIVACY.objection.title} title={PRIVACY.objection.title}>
      <p>{PRIVACY.objection.text}</p>
    </Callout>
  ),
};

/** Privacy policy: who is responsible, what each part of the site does with data, and the visitor's rights. */
export function PrivacyView({ onNavigate }: PrivacyViewProps) {
  return (
    <>
      <section aria-labelledby="privacy-title" className={styles.hero}>
        <Container>
          <Breadcrumb onNavigate={onNavigate} items={[HOME_CRUMB, { label: PRIVACY.title }]} />
          <div className={styles.heading}>
            <Eyebrow parts={[PRIVACY.eyebrow]} />
            <PageTitle id="privacy-title">{PRIVACY.title}</PageTitle>
            <p className={styles.intro}>{PRIVACY.intro}</p>
            <p className={styles.updated}>
              Last updated: <time dateTime={PRIVACY.updated.iso}>{PRIVACY.updated.label}</time>
            </p>
          </div>
        </Container>
      </section>

      {PRIVACY.sections.map((section) => (
        <PrivacySectionView key={section.id} section={section} extra={EXTRAS[section.id]} />
      ))}
    </>
  );
}
