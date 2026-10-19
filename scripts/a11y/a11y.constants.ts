import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import type { Theme } from "./a11y.types.ts";

/** Report folder (gitignored). */
export const OUT = "a11y-report";
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;
export const REFLOW_VIEWPORT = { width: 320, height: 640 } as const;
export const THEMES: readonly Theme[] = ["light", "dark"];
/** The page whose screenshots open the image viewer. */
export const LIGHTBOX_VIEW: View = VIEW.caseAutomotive;
export const MAX_SR_STEPS = 2500;
export const MAX_TAB_STOPS = 250;
/** Tab presses checked inside the open image viewer. */
export const LIGHTBOX_TAB_PRESSES = 40;
