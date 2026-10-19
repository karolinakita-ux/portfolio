import { MetaMatrix } from "#features/case-studies/components/MetaMatrix/MetaMatrix.tsx";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";

import { styles } from "./CaseIntro.styles.ts";
import type { CaseIntroProps } from "./CaseIntro.types.ts";

/** Shared case-study opening: breadcrumb → eyebrow + title → details panel → notice. */
export function CaseIntro({ c, onNavigate }: CaseIntroProps) {
  return (
    <section aria-labelledby="case-title" className={styles.root}>
      <Container>
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: c.shortTitle }]} />
        <div className={styles.heading}>
          <Eyebrow parts={c.eyebrow} />
          <h1 id="case-title" className={styles.title}>
            {c.title}
          </h1>
        </div>
        <MetaMatrix entries={c.meta} />
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
