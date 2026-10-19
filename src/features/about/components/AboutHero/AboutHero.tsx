import { ABOUT_INTRO } from "#features/about/about.content.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Breadcrumb } from "#shared/ui/Breadcrumb/Breadcrumb.tsx";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";

import { styles } from "./AboutHero.styles.ts";
import type { AboutHeroProps } from "./AboutHero.types.ts";

export function AboutHero({ onNavigate }: AboutHeroProps) {
  return (
    <section aria-labelledby="about-title" className={styles.root}>
      <Container>
        <Breadcrumb onNavigate={onNavigate} items={[WORK_CRUMB, { label: "About" }]} />
        <div className={styles.body}>
          {/* Kept short so it fits one line on desktop. No trailing period. */}
          <h1 id="about-title" className={styles.title}>
            Designing clarity for complex software
          </h1>
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <div className={styles.actions}>
            <Button
              as="a"
              href={hrefForView(VIEW.work, SECTION.workCases)}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(VIEW.work, SECTION.workCases);
              }}
            >
              Explore Selected Work
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
