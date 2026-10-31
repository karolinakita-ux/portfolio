import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";

/** Last move: 1 next, -1 previous, 0 just opened. Picks the image's entry animation. */
export type StepDirection = 1 | -1 | 0;

export interface LightboxState {
  items: readonly LightboxItem[];
  index: number;
  direction: StepDirection;
}

export interface ZoomState {
  /** Index in ZOOM_STEPS; 0 is "fit to the viewer". */
  step: number;
  /** Intrinsic size of the image: lightbox.css derives the fitted width from it, so zoom follows window resizes. */
  aspect: number;
  naturalWidth: number;
}

/** The point in the middle of a scroll pane, as fractions of its scroll size. */
export interface ScrollCenter {
  x: number;
  y: number;
}

/** Where a mouse drag started: pointer position and the pane's scroll offsets. */
export interface DragStart {
  x: number;
  y: number;
  left: number;
  top: number;
}

/**
 * A click or tap that zooms in: the point of the image it hit (fractions of the image's width and height) and where
 * the pointer was in the pane (px from its top left corner), so that point stays under the pointer once zoomed.
 */
export interface ZoomAnchor {
  x: number;
  y: number;
  left: number;
  top: number;
}

/**
 * A press in the image pane (a mouse button, a finger or a pen), kept until its click: where it started, whether on
 * the image, whether it moved (a drag, a pan, a swipe).
 */
export interface PointerPress {
  x: number;
  y: number;
  onImage: boolean;
  moved: boolean;
}

export interface TouchPoint {
  x: number;
  y: number;
}

/** The part of the window that nothing fixed or sticky covers, in px from its top: below the header, above the consent box. */
export interface FreeBand {
  top: number;
  bottom: number;
}
