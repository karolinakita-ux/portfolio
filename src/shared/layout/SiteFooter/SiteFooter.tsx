import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { NAV_ITEMS, SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { Container } from "#shared/ui/Container/Container.tsx";
import { CopyEmail } from "#shared/ui/CopyEmail/CopyEmail.tsx";
import { Linkedin, Mail } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { CURRENT_YEAR } from "./SiteFooter.constants.ts";
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
          <p>
            © {CURRENT_YEAR} {PROFILE.name} | All Rights Reserved
          </p>
          <p>{PROFILE.builtWith}</p>
          <p>
            <ViewLink
              view={VIEW.contact}
              anchor={SECTION.privacy}
              onNavigate={onNavigate}
              className={styles.privacyLink}
            >
              Privacy
            </ViewLink>
          </p>
        </div>
      </Container>
    </footer>
  );
}
