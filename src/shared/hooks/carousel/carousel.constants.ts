/** Quiet time after the last scroll event before a carousel's row counts as settled (ms). */
export const SETTLE_MS = 120;

/** How far a mouse press must move sideways before it drags the row instead of clicking (px). */
export const DRAG_START_PX = 6;

/** A drag at least this long moves on by one item, even when the item it started on is still the nearest (px). */
export const DRAG_NUDGE_PX = 40;

/** The track's `data-drag` while a mouse can drag it (Carousel.styles.ts: the grab cursor, no snapping). */
export const DRAG_STATE = {
  /** Ready: the grab cursor. */
  idle: "idle",
  /** The row follows the mouse: no snapping, no text selection. */
  active: "active",
  /** After the release, the row glides to its item: still no snapping, which would pull it elsewhere. */
  settling: "settling",
} as const;
