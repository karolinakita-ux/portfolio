import type { DesignFile } from "#features/case-studies/case-studies.types.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

export interface DesignFilesBannerProps {
  file: DesignFile;
  /** The case study the link sits in (sent with figma-click). */
  caseView: View;
}
