import { CvHeader } from "#features/cv/components/CvHeader/CvHeader.tsx";
import { CvSection } from "#features/cv/components/CvSection/CvSection.tsx";
import { Degree } from "#features/cv/components/Degree/Degree.tsx";
import { Role } from "#features/cv/components/Role/Role.tsx";
import { CV } from "#features/cv/cv.content.ts";

import { styles } from "./CvSheet.styles.ts";
import type { CvSheetProps } from "./CvSheet.types.ts";

/** The printable sheet: A4 width on screen, edge-to-edge inside the @page margins on paper. */
export function CvSheet({ cv = CV }: CvSheetProps) {
  return (
    <article aria-labelledby="cv-name" className={styles.root}>
      <CvHeader header={cv.header} />

      <CvSection id="summary" title="Professional Summary" keepTogether>
        <p className={styles.summary}>{cv.summary}</p>
      </CvSection>

      <CvSection id="competencies" title="Core Competencies" keepTogether>
        <ul className={styles.competencies}>
          {cv.competencies.map((row) => (
            <li key={row.group}>
              <strong className={styles.group}>{row.group}:</strong> {row.items.join(", ")}
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection id="experience" title="Professional Experience">
        <div className={styles.experience}>
          {cv.experience.map((role) => (
            <Role key={role.id} role={role} />
          ))}
        </div>
      </CvSection>

      <CvSection id="education" title="Education" keepTogether>
        {cv.education.map((item) => (
          <Degree key={item.id} item={item} />
        ))}
      </CvSection>
    </article>
  );
}
