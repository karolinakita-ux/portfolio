import { CvSheet } from "#features/cv/components/CvSheet/CvSheet.tsx";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";

import { styles } from "./CvView.styles.ts";
import type { CvViewProps } from "./CvView.types.ts";
import { usePrintCount } from "./usePrintCount.ts";

/**
 * CvView - ATS-friendly, single-column CV with A4 print / PDF export.
 *
 * Machine readability:
 *   - One linear reading order: no columns, tables, icons, images or fills.
 *   - Semantic structure: h1 name → h2 standard section names → h3 roles, real <ul> lists.
 *   - Separators are typed characters (" | ", " - ") so they survive PDF text extraction.
 *
 * Theming: the sheet carries .kb-theme-light, which re-declares the light
 * KitaBranding tokens on that subtree, so the CV reads as a light document
 * even when the site is in dark mode (and the PDF always matches the preview).
 *
 * Print (src/styles/print.css): A4 at 17mm margins; the action bar and site
 * chrome are `print:hidden`; .kb-print-block keeps each role and short section
 * on one page; .kb-print-keep-with-next keeps a heading with its content.
 */
export function CvView({ onNavigate }: CvViewProps) {
  const print = usePrintCount();
  return (
    <Container className={styles.root}>
      <div className={styles.toolbar}>
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "CV" }]} />
        <div className={styles.toolbarRow}>
          <div className={styles.note}>
            <Eyebrow parts={["Curriculum Vitae", "ATS-ready"]} />
            <p className={styles.noteText}>
              Single-column and plain text, so applicant tracking systems parse it cleanly. To save a PDF, choose Save
              as PDF, paper size A4, and turn off Headers and footers.
            </p>
          </div>
          <Button onClick={print} className={styles.download}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className={styles.sheet}>
        <CvSheet />
      </div>
    </Container>
  );
}
