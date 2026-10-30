import { ABOUT_ACTIONS, ABOUT_INTRO } from "#features/about/about.content.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { isPlainLeftClick } from "#shared/lib/ui/ui.utils.ts";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { FileText } from "#shared/ui/icons/icons.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";

import { styles } from "./AboutHero.styles.ts";
import type { AboutHeroProps } from "./AboutHero.types.ts";

export function AboutHero({ onNavigate }: AboutHeroProps) {
  return (
    <section aria-labelledby="about-title" className={styles.root}>
      <Container>
        <Breadcrumb onNavigate={onNavigate} items={[HOME_CRUMB, { label: "About" }]} />
        <div className={styles.body}>
          <PageTitle id="about-title">Designing Clarity for Complex Software</PageTitle>
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <div className={styles.actions}>
            <Button
              as="a"
              href={hrefForView(VIEW.cv)}
              variant="secondary"
              iconLeft={FileText}
              onClick={(event) => {
                track(EVENT.cvOpen, { place: "about" });
                if (!isPlainLeftClick(event)) return; // a new tab or window: the browser opens it
                event.preventDefault();
                onNavigate(VIEW.cv);
              }}
            >
              {ABOUT_ACTIONS.cv}
            </Button>{" "}
            <Button
              as="a"
              href={hrefForView(VIEW.work, SECTION.workCases)}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(VIEW.work, SECTION.workCases);
              }}
            >
              {ABOUT_ACTIONS.work}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
