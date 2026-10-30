import { CvSheet } from "#features/cv/components/CvSheet/CvSheet.tsx";
import { PdfDownload } from "#features/cv/components/PdfDownload/PdfDownload.tsx";
import { CV_PAGE } from "#features/cv/cv.content.ts";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";

import { styles } from "./CvView.styles.ts";
import type { CvViewProps } from "./CvView.types.ts";

/**
 * The CV page: the breadcrumb, a note with the PDF download, then the sheet. In print only the sheet is left,
 * always in the light theme (dark tokens are screen-only), on A4 (src/styles/print.css).
 */
export function CvView({ onNavigate }: CvViewProps) {
  return (
    <Container className={styles.root}>
      <div className={styles.crumbs}>
        <Breadcrumb onNavigate={onNavigate} items={[HOME_CRUMB, { label: CV_PAGE.crumb }]} />
      </div>
      <div className={styles.column}>
        <div className={styles.toolbar}>
          <p className={styles.note}>{CV_PAGE.note}</p> <PdfDownload />
        </div>
        <CvSheet onNavigate={onNavigate} />
      </div>
    </Container>
  );
}
