import { CV_LINK } from "#features/cv/cv.styles.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";

import type { CvEmailLinkProps } from "./CvEmailLink.types.ts";

/** The email address as a mailto: link on the CV (its header and the consent), counted as email-click. */
export function CvEmailLink({ email, className = CV_LINK }: CvEmailLinkProps) {
  return (
    <a
      href={"mailto:" + email}
      onClick={() => track(EVENT.emailClick, { action: "mailto", place: "cv" })}
      className={className}
    >
      {email}
    </a>
  );
}
