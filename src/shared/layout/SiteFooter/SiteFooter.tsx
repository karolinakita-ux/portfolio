import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { NAV_ITEMS, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { Container } from "#shared/ui/Container/Container.tsx";
import { CopyEmail } from "#shared/ui/CopyEmail/CopyEmail.tsx";
import { Linkedin, Mail } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { TextLink } from "#shared/ui/TextLink/TextLink.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { CURRENT_YEAR, RELEASE_NOTES_URL, SITE_VERSION } from "./SiteFooter.constants.ts";
import { styles } from "./SiteFooter.styles.ts";
import type { SiteFooterProps } from "./SiteFooter.types.ts";

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  return (
    <footer className={styles.root}>
      <Container className={styles.container}>
        <div className={styles.columns}>
          <nav aria-labelledby="footer-explore-title">
            <h2 id="footer-explore-title" className={styles.heading}>
              Explore
            </h2>
            <ul className={styles.exploreList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.view}>
                  <ViewLink view={item.view} onNavigate={onNavigate} className={styles.exploreLink}>
                    {item.label}
                  </ViewLink>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className={styles.heading}>
              Contact
            </h2>
            <ul className={styles.contactList}>
              <li className={styles.linkedinItem}>
                <Linkedin aria-hidden="true" size={16} className={styles.icon} />
                <a
                  href={PROFILE.linkedinUrl}
                  {...EXTERNAL_LINK}
                  onClick={() => track(EVENT.linkedinClick, { target: "profile", place: "footer" })}
                  className={styles.linkedinLink}
                >
                  {PROFILE.name} | LinkedIn
                  <NewTabNote />
                </a>
              </li>
              <li className={styles.emailItem}>
                <CopyEmail
                  email={PROFILE.email}
                  place="footer"
                  icon={<Mail aria-hidden="true" size={16} className={styles.icon} />}
                />
              </li>
            </ul>
          </section>
        </div>

        <div className={styles.legal}>
          {/* The version sits on this line, two lines away from Privacy: two small links in a row would be
              closer than 24px (WCAG 2.5.8). */}
          <p>
            © {CURRENT_YEAR} {PROFILE.name} | All Rights Reserved |{" "}
            {RELEASE_NOTES_URL ? (
              <TextLink href={RELEASE_NOTES_URL} external className={styles.versionLink}>
                Version {SITE_VERSION}
                <VisuallyHidden> release notes</VisuallyHidden>
              </TextLink>
            ) : (
              `Version ${SITE_VERSION}`
            )}
          </p>
          <p>{PROFILE.builtWith}</p>
          <p>
            <ViewLink view={VIEW.privacy} onNavigate={onNavigate} className={styles.privacyLink}>
              Privacy
            </ViewLink>
          </p>
        </div>
      </Container>
    </footer>
  );
}
