import { EngagementTiers } from "#features/contact/components/EngagementTiers/EngagementTiers.tsx";
import { CONTACT } from "#features/contact/contact.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { cvPdfLabel } from "#shared/content/profile.utils.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { CopyEmail } from "#shared/ui/CopyEmail/CopyEmail.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { Download, ExternalLink, FileText } from "#shared/ui/icons/icons.tsx";
import { InfoTable } from "#shared/ui/InfoTable/InfoTable.tsx";
import { InfoTableCell } from "#shared/ui/InfoTableCell/InfoTableCell.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./ContactView.styles.ts";
import type { ContactViewProps } from "./ContactView.types.ts";

export function ContactView({ onNavigate }: ContactViewProps) {
  return (
    <>
      <section aria-labelledby="contact-title" className={styles.hero}>
        <Container>
          <Breadcrumb onNavigate={onNavigate} items={[HOME_CRUMB, { label: "Contact" }]} />
          <div className={styles.heading}>
            <Eyebrow parts={[CONTACT.eyebrow]} />
            <PageTitle id="contact-title">{CONTACT.title}</PageTitle>
            <p className={styles.intro}>{CONTACT.intro}</p>
          </div>
        </Container>
      </section>

      <Section id="contact-channels" title="Primary Channels">
        <InfoTable>
          <InfoTableCell label="Direct Email">
            <span className={styles.emailRow}>
              <CopyEmail email={PROFILE.email} place="contact" textClassName={styles.emailText} />
            </span>
          </InfoTableCell>
          <InfoTableCell label="LinkedIn Profile">
            <a
              href={PROFILE.linkedinUrl}
              {...EXTERNAL_LINK}
              onClick={() => track(EVENT.linkedinClick, { target: "profile", place: "contact" })}
              className={styles.linkedinLink}
            >
              {PROFILE.name} | LinkedIn
              <ExternalLink aria-hidden="true" size={16} className={styles.linkIcon} />
              <NewTabNote />
            </a>
          </InfoTableCell>
        </InfoTable>
        <InfoTable columns={1}>
          <InfoTableCell label={CONTACT.cv.label}>
            <span className={styles.cvLinks}>
              <ViewLink
                view={VIEW.cv}
                onNavigate={onNavigate}
                onClick={() => track(EVENT.cvOpen, { place: "contact" })}
                className={styles.cvLink}
              >
                <FileText aria-hidden="true" size={16} className={styles.linkIcon} />
                {CONTACT.cv.view}
              </ViewLink>{" "}
              <a
                href={PROFILE.cvPdfUrl}
                download
                onClick={() => track(EVENT.cvDownload, { place: "contact" })}
                className={styles.cvLink}
              >
                <Download aria-hidden="true" size={16} className={styles.linkIcon} />
                {cvPdfLabel(CONTACT.cv.download)}
              </a>
            </span>
          </InfoTableCell>
        </InfoTable>
      </Section>

      <Section id="contact-availability" title="Current Availability & Roles">
        <InfoTable>
          <InfoTableCell label="Availability">
            <EngagementTiers items={CONTACT.engagements} />
          </InfoTableCell>
          <InfoTableCell label="Target Roles">
            <ul className={styles.roles}>
              {CONTACT.targetRoles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </InfoTableCell>
        </InfoTable>
      </Section>

      <Section id="contact-location" title="Location & Working Hours">
        <InfoTable>
          <InfoTableCell label="Location">{CONTACT.location}</InfoTableCell>
          <InfoTableCell label="Collaboration">{CONTACT.collaboration}</InfoTableCell>
        </InfoTable>
      </Section>
    </>
  );
}
