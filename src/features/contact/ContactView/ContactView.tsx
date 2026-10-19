import { EngagementTiers } from "#features/contact/components/EngagementTiers/EngagementTiers.tsx";
import { InfoCell } from "#features/contact/components/InfoCell/InfoCell.tsx";
import { InfoPanel } from "#features/contact/components/InfoPanel/InfoPanel.tsx";
import { CONTACT } from "#features/contact/contact.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { SECTION } from "#shared/lib/routes/routes.constants.ts";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { CopyEmail } from "#shared/ui/CopyEmail/CopyEmail.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ExternalLink } from "#shared/ui/icons/icons.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";
import { Section } from "#shared/ui/Section/Section.tsx";

import { styles } from "./ContactView.styles.ts";
import type { ContactViewProps } from "./ContactView.types.ts";

export function ContactView({ onNavigate }: ContactViewProps) {
  return (
    <>
      <section aria-labelledby="contact-title" className={styles.hero}>
        <Container>
          <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "Contact" }]} />
          <div className={styles.heading}>
            <Eyebrow parts={[CONTACT.eyebrow]} />
            <h1 id="contact-title" className={styles.title}>
              {CONTACT.title}
            </h1>
            <p className={styles.intro}>{CONTACT.intro}</p>
          </div>
        </Container>
      </section>

      <Section id="contact-channels" title="Primary Channels">
        <InfoPanel>
          <InfoCell label="Direct Email">
            <span className={styles.emailRow}>
              <CopyEmail email={PROFILE.email} place="contact" textClassName={styles.emailText} />
            </span>
          </InfoCell>
          <InfoCell label="LinkedIn Profile">
            <a
              href={PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(EVENT.linkedinClick, { target: "profile", place: "contact" })}
              className={styles.linkedinLink}
            >
              {PROFILE.name} | LinkedIn
              <ExternalLink aria-hidden="true" size={16} className={styles.linkedinIcon} />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          </InfoCell>
        </InfoPanel>
      </Section>

      <Section id="contact-availability" title="Current Availability & Roles">
        <InfoPanel>
          <InfoCell label="Availability">
            <EngagementTiers items={CONTACT.engagements} />
          </InfoCell>
          <InfoCell label="Target Roles">
            <ul className={styles.roles}>
              {CONTACT.targetRoles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </InfoCell>
        </InfoPanel>
      </Section>

      <Section id="contact-location" title="Location & Working Hours">
        <InfoPanel>
          <InfoCell label="Location">{CONTACT.location}</InfoCell>
          <InfoCell label="Collaboration">{CONTACT.collaboration}</InfoCell>
        </InfoPanel>
      </Section>

      {/* Linked from the footer on every page: keep the section id stable. */}
      <Section id={SECTION.privacy} title={CONTACT.privacy.title} description={CONTACT.privacy.intro}>
        <ul className={styles.privacyList}>
          {CONTACT.privacy.points.map(([term, text]) => (
            <li key={term}>{lead(term, text)}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}
