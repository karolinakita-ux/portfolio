/** Zoom levels as multiples of the fitted width; index 0 is "fit to the viewer". */
export const ZOOM_STEPS = [1, 1.5, 2, 3, 4] as const;

export const MAX_ZOOM_STEP = ZOOM_STEPS.length - 1;

/** A click on the fitted image zooms to this step (200%: a close-up in one click); a click on the zoomed image goes back to fit. */
export const CLICK_ZOOM_STEP = 2;

/**
 * Zoom needs the md breakpoint or a mouse / trackpad. Phones and small touch screens fit and keep their own
 * pinch-zoom; a desktop browser zoomed to 200-400% (a narrow viewport) keeps the zoom controls (WCAG 1.4.4, 1.4.10).
 */
export const ZOOM_QUERY = "(min-width: 768px), (pointer: fine)";

/** Shortest horizontal finger travel, in px, that counts as a swipe. */
export const SWIPE_MIN_DISTANCE = 50;
