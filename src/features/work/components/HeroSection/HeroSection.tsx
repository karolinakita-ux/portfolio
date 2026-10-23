import { HERO_ACTIONS } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";
import { Eyebrow } from "#shared/ui/Eyebrow/Eyebrow.tsx";
import { ArrowDown, ArrowUpRight, Blocks, Figma, Github } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
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
          <PageTitle id="hero-title">Clarity for complex enterprise software</PageTitle>
          <p className={styles.lead}>
            I have 8+ years of experience turning data-heavy B2B platforms and messy workflows into clear, usable
            digital products. With a background in psychology, I focus on how people actually think and work - combining
            practical research with solid design systems that engineers can easily build.
          </p>
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
            </Button>
            <Button
              as="a"
              href={PROFILE.figmaWorkspaceUrl}
              {...EXTERNAL_LINK}
              variant="secondary"
              iconLeft={Figma}
              iconRight={ArrowUpRight}
              onClick={() => track(EVENT.figmaClick, { place: "hero" })}
            >
              {HERO_ACTIONS.figma}
              <NewTabNote />
            </Button>
            {PROFILE.repositoryUrl ? (
              <Button
                as="a"
                href={PROFILE.repositoryUrl}
                {...EXTERNAL_LINK}
                variant="secondary"
                iconLeft={Github}
                iconRight={ArrowUpRight}
                onClick={() => track(EVENT.githubClick, { place: "hero" })}
              >
                {HERO_ACTIONS.source}
                <NewTabNote />
              </Button>
            ) : null}
            {PROFILE.storybookUrl ? (
              <Button
                as="a"
                href={PROFILE.storybookUrl}
                {...EXTERNAL_LINK}
                variant="secondary"
                iconLeft={Blocks}
                iconRight={ArrowUpRight}
                onClick={() => track(EVENT.storybookClick, { place: "hero" })}
              >
                {HERO_ACTIONS.components}
                <NewTabNote />
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
