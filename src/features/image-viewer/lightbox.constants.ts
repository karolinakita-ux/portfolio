/** Zoom levels as multiples of the fitted width; index 0 is "fit to the viewer". */
export const ZOOM_STEPS = [1, 1.5, 2, 3, 4] as const;

export const MAX_ZOOM_STEP = ZOOM_STEPS.length - 1;

/**
 * A click or tap on the fitted image zooms to this step (200%: a close-up in one go); a click or tap on the zoomed
 * image goes back to fit.
 */
export const CLICK_ZOOM_STEP = 2;

/** Shortest horizontal finger travel, in px, that counts as a swipe. */
export const SWIPE_MIN_DISTANCE = 50;
