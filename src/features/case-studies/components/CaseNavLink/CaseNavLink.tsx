import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { ArrowLeft, ArrowRight } from "#shared/ui/icons/icons.tsx";

import { styles } from "./CaseNavLink.styles.ts";
import type { CaseNavLinkProps } from "./CaseNavLink.types.ts";

/** Previous / next case study link; counted as case-nav. */
export function CaseNavLink({ from, target, direction, onNavigate }: CaseNavLinkProps) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const arrow = <Icon aria-hidden="true" size={16} className={styles.arrow(isNext)} />;
  return (
    <a
      href={hrefForView(target.view)}
      onClick={(event) => {
        event.preventDefault();
        track(EVENT.caseNav, { from, to: target.view, direction });
        onNavigate(target.view);
      }}
      className={styles.root(isNext)}
    >
      <span className={styles.action}>
        {!isNext && arrow}
        {target.action ?? (isNext ? "Next Case Study" : "Previous Case Study")}
        {isNext && arrow}
      </span>{" "}
      {target.label && <span className={styles.label}>{target.label}</span>}
    </a>
  );
}
