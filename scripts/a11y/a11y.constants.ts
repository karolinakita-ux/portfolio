import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import type { Theme } from "./a11y.types.ts";

/** Report folder (gitignored). */
export const OUT = "a11y-report";
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
/** Views tabbed through with the statistics consent box showing (WCAG 2.4.11: focus must not hide behind it). */
export const CONSENT_VIEWS: readonly View[] = [VIEW.work, VIEW.about, VIEW.caseAutomotive, VIEW.privacy];
export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;
export const REFLOW_VIEWPORT = { width: 320, height: 640 } as const;
/** A 1280 x 1024 screen at 400% zoom, where the consent box is taller than the window (WCAG 1.4.10). */
export const ZOOM_VIEWPORT = { width: 320, height: 256 } as const;
export const THEMES: readonly Theme[] = ["light", "dark"];
/** The browser's default text size for the large-text check: 200% of the usual 16px (WCAG 1.4.4). */
export const LARGE_TEXT_PX = 32;
/** The page whose screenshots open the image viewer. */
export const LIGHTBOX_VIEW: View = VIEW.caseAutomotive;
export const MAX_SR_STEPS = 2500;
export const MAX_TAB_STOPS = 250;
/** Tab presses checked inside the open image viewer. */
export const LIGHTBOX_TAB_PRESSES = 40;
