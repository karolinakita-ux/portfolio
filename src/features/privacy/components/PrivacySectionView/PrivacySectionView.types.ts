import type { ReactNode } from "react";

import type { PrivacySection } from "#features/privacy/privacy.types.ts";

export interface PrivacySectionViewProps {
  section: PrivacySection;
  /** The section's own component, between its points and its closing paragraphs. */
  extra?: ReactNode;
}
