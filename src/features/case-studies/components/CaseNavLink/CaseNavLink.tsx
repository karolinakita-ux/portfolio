import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { ArrowLeft, ArrowRight } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { CASE_NAV_ACTION } from "./CaseNavLink.constants.ts";
import { caseNavLink, styles } from "./CaseNavLink.styles.ts";
import type { CaseNavLinkProps } from "./CaseNavLink.types.ts";

/**
 * Previous / next case study link; counted as case-nav with its place. At the top it shows only "Previous" or
 * "Next": the case name is part of its name for screen readers ("Next case study: …"), so the label they
 * hear starts with the one on screen (WCAG 2.5.3).
 */
export function CaseNavLink({ from, target, direction, place, onNavigate }: CaseNavLinkProps) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const arrow = <Icon aria-hidden="true" size={16} className={styles.arrow(isNext)} />;
  const top = place === "top";
  const action = (top ? undefined : target.action) ?? CASE_NAV_ACTION[place][direction];
  return (
    <a
      href={hrefForView(target.view)}
      onClick={(event) => {
        event.preventDefault();
        track(EVENT.caseNav, { from, to: target.view, direction, place });
        onNavigate(target.view);
      }}
      className={caseNavLink({ place, direction })}
    >
      <span className={styles.action}>
        {!isNext && arrow}
        {action}
        {isNext && arrow}
      </span>{" "}
      {target.label &&
        (top ? (
          <VisuallyHidden>case study: {target.label}</VisuallyHidden>
        ) : (
          <span className={styles.label}>{target.label}</span>
        ))}
    </a>
  );
}
