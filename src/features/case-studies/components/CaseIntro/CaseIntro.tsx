import { CasePager } from "#features/case-studies/components/CasePager/CasePager.tsx";
import { DesignFileLink } from "#features/case-studies/components/DesignFileLink/DesignFileLink.tsx";
import { MetaMatrix } from "#features/case-studies/components/MetaMatrix/MetaMatrix.tsx";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";

import { styles } from "./CaseIntro.styles.ts";
import type { CaseIntroProps } from "./CaseIntro.types.ts";

/**
 * Shared case-study opening: breadcrumb and previous / next → eyebrow + title → details panel → the Figma file
 * link (when the case has one) → notice.
 */
export function CaseIntro({ c, onNavigate }: CaseIntroProps) {
  return (
    <section aria-labelledby="case-title" className={styles.root}>
      <Container>
        <div className={styles.topRow}>
          <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: c.shortTitle }]} />{" "}
          <CasePager from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />
        </div>
        <div className={styles.heading}>
          <Eyebrow parts={c.eyebrow} />
          <PageTitle id="case-title">{c.title}</PageTitle>
        </div>
        <MetaMatrix entries={c.meta} />
        {c.designFile && (
          <div className={styles.designFile}>
            <DesignFileLink file={c.designFile} caseView={c.view} place="top" />
          </div>
        )}
        {c.notice && (
          <div className={styles.notice}>
            <Callout tone={c.notice.tone} label={c.notice.label}>
              {c.notice.text}
            </Callout>
          </div>
        )}
      </Container>
    </section>
  );
}
