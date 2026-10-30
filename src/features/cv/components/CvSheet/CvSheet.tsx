import { CvConsent } from "#features/cv/components/CvConsent/CvConsent.tsx";
import { CvEntry } from "#features/cv/components/CvEntry/CvEntry.tsx";
import { CvHeader } from "#features/cv/components/CvHeader/CvHeader.tsx";
import { CvSection } from "#features/cv/components/CvSection/CvSection.tsx";
import { CvSkills } from "#features/cv/components/CvSkills/CvSkills.tsx";
import { CV_NAME_ID, CV_PDF_ATTRIBUTE, CV_SECTION, CV_SHEET_ID } from "#features/cv/cv.constants.ts";
import { CV, CV_PAGE } from "#features/cv/cv.content.ts";

import { styles } from "./CvSheet.styles.ts";
import type { CvSheetProps } from "./CvSheet.types.ts";

/**
 * The CV itself (Figma's Long CV): an A4-wide sheet on screen in the site's theme, edge to edge inside the page
 * margins on paper and always light there. scripts/cv-pdf.ts prints it to public/karolina-kita-cv.pdf.
 */
export function CvSheet({ onNavigate }: CvSheetProps) {
  const { titles } = CV_PAGE;
  const footer = { [CV_PDF_ATTRIBUTE.footer]: CV.footer };
  return (
    <article id={CV_SHEET_ID} aria-labelledby={CV_NAME_ID} className={styles.root} {...footer}>
      <CvHeader header={CV.header} onNavigate={onNavigate} />

      <CvSection id={CV_SECTION.summary} title={titles.summary}>
        <p className={styles.summary}>{CV.summary}</p>
      </CvSection>

      <CvSection id={CV_SECTION.experience} title={titles.experience}>
        <div className={styles.entries}>
          {CV.experience.map((entry) => (
            <CvEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </CvSection>

      <CvSection id={CV_SECTION.skills} title={titles.skills}>
        <CvSkills groups={CV.skills} />
      </CvSection>

      <CvSection id={CV_SECTION.education} title={titles.education}>
        {CV.education.map((entry) => (
          <CvEntry key={entry.id} entry={entry} />
        ))}
      </CvSection>

      <CvConsent consent={CV.consent} email={CV.header.email} />
    </article>
  );
}
