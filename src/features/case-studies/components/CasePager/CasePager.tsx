import { CaseNavLink } from "#features/case-studies/components/CaseNavLink/CaseNavLink.tsx";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";

import { PAGER_NAME } from "./CasePager.constants.ts";
import { styles } from "./CasePager.styles.ts";
import type { CasePagerProps } from "./CasePager.types.ts";

/**
 * Previous / next case study at the top of a case study, beside the breadcrumb, so a reader can move on
 * without scrolling to the end, where CaseNav names the cases in full. Case studies only: the breadcrumb
 * already leads back to Work, so the first and the last case show one link.
 */
export function CasePager({ from, prev, next, onNavigate }: CasePagerProps) {
  const before = prev?.view === VIEW.work ? undefined : prev;
  const after = next?.view === VIEW.work ? undefined : next;
  if (!before && !after) return null;
  const name = before && after ? PAGER_NAME.both : before ? PAGER_NAME.prev : PAGER_NAME.next;
  return (
    <nav aria-label={name} className={styles.root}>
      {before && <CaseNavLink from={from} target={before} direction="prev" place="top" onNavigate={onNavigate} />}{" "}
      {after && <CaseNavLink from={from} target={after} direction="next" place="top" onNavigate={onNavigate} />}
    </nav>
  );
}
