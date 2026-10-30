import { HERO_ACTIONS, HERO_LEAD } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { isPlainLeftClick } from "#shared/lib/ui/ui.utils.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ArrowDown, FileText } from "#shared/ui/icons/icons.tsx";
import { PageTitle } from "#shared/ui/PageTitle/PageTitle.tsx";

import { styles } from "./HeroSection.styles.ts";
import type { HeroSectionProps } from "./HeroSection.types.ts";

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.root}>
      <Container>
        <div className={styles.body}>
          <Eyebrow parts={[PROFILE.name, PROFILE.role]} />
          {/* No trailing period. Kept short (~40 characters) so it fits one line on desktop from 1024px. */}
          <PageTitle id="hero-title">Clarity for Complex Enterprise Software</PageTitle>
          <p className={styles.lead}>{HERO_LEAD}</p>
          {/*
            One primary and one secondary action. The Figma workspace, the code and the component library are in the
            Behind the Design banner below the case studies (ProcessBanner): here they split attention.
          */}
          <div className={styles.actions}>
            <Button
              as="a"
              href={hrefForView(VIEW.work, SECTION.workCases)}
              iconRight={ArrowDown}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(VIEW.work, SECTION.workCases, { smooth: true });
              }}
            >
              {HERO_ACTIONS.cases}
            </Button>{" "}
            <Button
              as="a"
              href={hrefForView(VIEW.cv)}
              variant="secondary"
              iconLeft={FileText}
              onClick={(event) => {
                track(EVENT.cvOpen, { place: "hero" });
                if (!isPlainLeftClick(event)) return; // a new tab or window: the browser opens it
                event.preventDefault();
                onNavigate(VIEW.cv);
              }}
            >
              {HERO_ACTIONS.cv}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
