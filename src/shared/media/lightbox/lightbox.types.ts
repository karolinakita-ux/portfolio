/** Which way the visitor zoomed an image in the viewer. */
export type ZoomDirection = "in" | "out";

/**
 * How the visitor zoomed: a click or tap on the image (`click`; the statistics' `input` tells the two apart), a zoom
 * button, or a key (+, -, 0).
 */
export type ZoomMethod = "click" | "button" | "key";

export interface LightboxItem {
  src: string;
  /**
   * Optional copy of `src` with more pixels (the same picture, about twice as wide). The viewer opens on `src` and
   * swaps this in only when the screen needs more pixels than `src` has: a dense screen, the viewer's zoom or a
   * pinch-zoom (image-viewer, useSharpImage). The page and the preloads keep the lighter `src`.
   */
  zoomSrc?: string;
  alt: string;
  title: string;
  /** Pixel size, when known: the viewer shows a placeholder of this shape while the image loads. */
  width?: number;
  height?: number;
  /** Called when the viewer moves to this image (arrow, key or swipe), not when it opens on it. */
  onShow?: (direction: "prev" | "next") => void;
  /**
   * Called when the visitor zooms this image in or out (a click or tap on it, a zoom button or a key), not when the
   * viewer goes back to fit by itself (another image, closing).
   */
  onZoom?: (direction: ZoomDirection, method: ZoomMethod) => void;
}

/**
 * Opens the image viewer at `index` of `items`; `trigger` gets focus back on close.
 *   const openImage = useLightbox();
 *   openImage(items, index, triggerElement);
 */
export type OpenLightbox = (items: readonly LightboxItem[], index: number, trigger?: HTMLElement | null) => void;
