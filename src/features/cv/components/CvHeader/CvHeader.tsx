import { CvEmailLink } from "#features/cv/components/CvEmailLink/CvEmailLink.tsx";
import { CV_NAME_ID, CV_PDF_ATTRIBUTE } from "#features/cv/cv.constants.ts";
import { CV_PAGE } from "#features/cv/cv.content.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./CvHeader.styles.ts";
import type { CvHeaderProps } from "./CvHeader.types.ts";

/**
 * Name, headline and contact line. The links show their address as the label, so a printed CV still says where
 * they go. The portfolio link opens the Work page here; in the PDF it is the absolute address with ?ref=cv.
 */
export function CvHeader({ header, onNavigate }: CvHeaderProps) {
  const pdfHref = { [CV_PDF_ATTRIBUTE.href]: header.site.pdfHref };
  return (
    <header className={styles.root}>
      <h1 id={CV_NAME_ID} className={styles.name}>
        {header.name}
      </h1>
      <p className={styles.headline}>{header.headline}</p>
      <ul aria-label={CV_PAGE.contactsLabel} className={styles.contacts}>
        <li className={styles.item}>
          <span className={styles.text}>{header.location}</span>
        </li>{" "}
        <li className={styles.item}>
          <CvEmailLink email={header.email} className={styles.link} />
        </li>{" "}
        <li className={styles.item}>
          <a
            href={header.linkedin.href}
            {...EXTERNAL_LINK}
            onClick={() => track(EVENT.linkedinClick, { target: "profile", place: "cv" })}
            className={styles.link}
          >
            {header.linkedin.label}
            <NewTabNote />
          </a>
        </li>{" "}
        <li className={styles.item}>
          <ViewLink view={VIEW.work} onNavigate={onNavigate} className={styles.link} {...pdfHref}>
            {header.site.label}
          </ViewLink>
        </li>
      </ul>
    </header>
  );
}
