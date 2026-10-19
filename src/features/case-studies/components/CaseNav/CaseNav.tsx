import { CaseNavLink } from "#features/case-studies/components/CaseNavLink/CaseNavLink.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";

import { styles } from "./CaseNav.styles.ts";
import type { CaseNavProps } from "./CaseNav.types.ts";

/**
 * Previous / next case study links - borderless, inline.
 * Hover: label underlines, arrow nudges outward, project name darkens.
 * Wraps on narrow screens; Next keeps right alignment via ml-auto.
 */
export function CaseNav({ from, prev, next, onNavigate }: CaseNavProps) {
  return (
    <section aria-label="More case studies" className={styles.root}>
      <Container>
        <nav aria-label="Case study navigation" className={styles.nav(prev !== undefined, next !== undefined)}>
          {prev && <CaseNavLink from={from} target={prev} direction="prev" onNavigate={onNavigate} />}
          {next && <CaseNavLink from={from} target={next} direction="next" onNavigate={onNavigate} />}
        </nav>
      </Container>
    </section>
  );
}
