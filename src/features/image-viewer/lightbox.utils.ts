import type { CSSProperties } from "react";

import { DRAG_PX } from "#shared/lib/analytics/analytics.constants.ts";
import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";

import { SWIPE_MIN_DISTANCE, ZOOM_QUERY } from "./lightbox.constants.ts";
import type { ScrollCenter, TouchPoint, ZoomAnchor, ZoomState } from "./lightbox.types.ts";

export const canZoom = (): boolean => typeof window.matchMedia !== "function" || window.matchMedia(ZOOM_QUERY).matches;

export const readCenter = (pane: HTMLElement): ScrollCenter => ({
  x: (pane.scrollLeft + pane.clientWidth / 2) / (pane.scrollWidth || 1),
  y: (pane.scrollTop + pane.clientHeight / 2) / (pane.scrollHeight || 1),
});

export const scrollToCenter = (pane: HTMLElement, center: ScrollCenter): void => {
  pane.scrollLeft = center.x * pane.scrollWidth - pane.clientWidth / 2;
  pane.scrollTop = center.y * pane.scrollHeight - pane.clientHeight / 2;
};

/**
 * A pointer that travelled further than DRAG_PX from where it was pressed dragged (panned the zoomed image): its
 * release is not a click. The statistics draw the same line between a click and a drag.
 */
export const travelledFar = (from: TouchPoint, x: number, y: number): boolean =>
  Math.hypot(x - from.x, y - from.y) > DRAG_PX;

const fraction = (offset: number, size: number): number => (size > 0 ? Math.min(Math.max(offset / size, 0), 1) : 0.5);

/** The point of the fitted image a click at (x, y) hit, and where the pointer was in the pane. */
export const anchorAt = (x: number, y: number, image: HTMLElement, pane: HTMLElement): ZoomAnchor => {
  const shown = image.getBoundingClientRect();
  const frame = pane.getBoundingClientRect();
  return {
    x: fraction(x - shown.left, shown.width),
    y: fraction(y - shown.top, shown.height),
    left: x - frame.left - pane.clientLeft,
    top: y - frame.top - pane.clientTop,
  };
};

/**
 * Scrolls the zoomed pane so the anchor's point of the image is under the pointer again. Near an edge of the image the
 * pane cannot scroll that far, and the browser stops it at the edge. The image's place is measured, never assumed:
 * while the zoomed image is still smaller than the pane one way (the height of a wide screenshot), its auto margins
 * centre it that way, as when fitted, and the pane has nothing to scroll there.
 */
export const scrollToAnchor = (pane: HTMLElement, image: HTMLElement, anchor: ZoomAnchor): void => {
  const shown = image.getBoundingClientRect();
  const frame = pane.getBoundingClientRect();
  // The image's place in the pane's scrolled content, its centring margins included.
  const left = shown.left - frame.left - pane.clientLeft + pane.scrollLeft;
  const top = shown.top - frame.top - pane.clientTop + pane.scrollTop;
  pane.scrollLeft = left + anchor.x * shown.width - anchor.left;
  pane.scrollTop = top + anchor.y * shown.height - anchor.top;
};

/** `index + delta`, wrapping around both ends. */
export const wrapIndex = (index: number, delta: number, length: number): number => (index + delta + length) % length;

/** The images next to `index` (next, previous, the one after next), without the current one or duplicates. */
export const neighbourSources = (items: readonly LightboxItem[], index: number): string[] => {
  const near = new Set<string>();
  for (const offset of [1, -1, 2]) {
    const src = items[wrapIndex(index, offset, items.length)]?.src;
    if (src !== undefined && src !== items[index]?.src) near.add(src);
  }
  return [...near];
};

/** A finger move long enough and mostly horizontal; dx < 0 is a swipe to the next image. */
export const isSwipe = (dx: number, dy: number): boolean =>
  Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) >= Math.abs(dy) * 1.5;

/**
 * The image covers more device pixels across than its file has: its width on the page, times the screen's density
 * and the browser's pinch-zoom (the viewer's own zoom is in the width already). Each file pixel is then stretched.
 */
export const needsMorePixels = (image: HTMLImageElement): boolean =>
  image.naturalWidth > 0 &&
  image.getBoundingClientRect().width * window.devicePixelRatio * (window.visualViewport?.scale ?? 1) >
    image.naturalWidth;

/**
 * CSS variables lightbox.css sizes the zoomed image with (.kb-lightbox-image-zoomed). `pageWidth`: the page file's
 * width while the image shows its sharper copy (useSharpImage), which keeps the size the page file had.
 */
export const zoomStyle = (zoom: ZoomState, level: number, pageWidth?: number): CSSProperties =>
  ({
    "--kb-zoom": level,
    "--kb-aspect": zoom.aspect,
    "--kb-natural-width": (pageWidth ?? zoom.naturalWidth) + "px",
  }) as CSSProperties;

/** The fitted image's size limit while it shows its sharper copy: the page file's width (.kb-lightbox-image). */
export const fittedStyle = (pageWidth: number | undefined): CSSProperties | undefined =>
  pageWidth === undefined ? undefined : ({ "--kb-natural-width": pageWidth + "px" } as CSSProperties);

/** CSS variables for a skeleton of the image's own shape (.kb-lightbox-skeleton), or undefined when the size is unknown. */
export const skeletonStyle = ({ width, height }: LightboxItem): CSSProperties | undefined =>
  width !== undefined && height !== undefined && width > 0 && height > 0
    ? ({ "--kb-aspect": width / height, "--kb-natural-width": width + "px" } as CSSProperties)
    : undefined;
