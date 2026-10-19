import type { CSSProperties } from "react";

import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";

import { SWIPE_MIN_DISTANCE, ZOOM_QUERY } from "./lightbox.constants.ts";
import type { ScrollCenter, ZoomState } from "./lightbox.types.ts";

export const canZoom = (): boolean => typeof window.matchMedia !== "function" || window.matchMedia(ZOOM_QUERY).matches;

export const readCenter = (pane: HTMLElement): ScrollCenter => ({
  x: (pane.scrollLeft + pane.clientWidth / 2) / (pane.scrollWidth || 1),
  y: (pane.scrollTop + pane.clientHeight / 2) / (pane.scrollHeight || 1),
});

export const scrollToCenter = (pane: HTMLElement, center: ScrollCenter): void => {
  pane.scrollLeft = center.x * pane.scrollWidth - pane.clientWidth / 2;
  pane.scrollTop = center.y * pane.scrollHeight - pane.clientHeight / 2;
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

/** CSS variables app.css sizes the zoomed image with (.kb-lightbox-image-zoomed). */
export const zoomStyle = (zoom: ZoomState, level: number): CSSProperties =>
  ({ "--kb-zoom": level, "--kb-aspect": zoom.aspect, "--kb-natural-width": zoom.naturalWidth + "px" }) as CSSProperties;

/** CSS variables for a skeleton of the image's own shape (.kb-lightbox-skeleton), or undefined when the size is unknown. */
export const skeletonStyle = ({ width, height }: LightboxItem): CSSProperties | undefined =>
  width !== undefined && height !== undefined && width > 0 && height > 0
    ? ({ "--kb-aspect": width / height, "--kb-natural-width": width + "px" } as CSSProperties)
    : undefined;
