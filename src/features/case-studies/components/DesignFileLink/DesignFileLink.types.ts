import type { DesignFile } from "#features/case-studies/case-studies.types.ts";
import type { DesignFilePlace } from "#shared/lib/analytics/analytics.types.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

export interface DesignFileLinkProps {
  file: DesignFile;
  /** The case study the link sits in (sent with figma-click). */
  caseView: View;
  /** Where it sits (sent with figma-click): `top` under the details panel, `end` in the design files banner. */
  place: DesignFilePlace;
}
