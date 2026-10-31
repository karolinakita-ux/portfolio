/** Which way the visitor zoomed an image in the viewer. */
export type ZoomDirection = "in" | "out";

/**
 * How the visitor zoomed: a click or tap on the image (`click`; the statistics' `input` tells the two apart), a zoom
 * button, or a key (+, -, 0).
 */
export type ZoomMethod = "click" | "button" | "key";

/** Where an image sits on the page: the viewer lands there when it closes on that image. */
export interface LightboxPlace {
  /** Gets keyboard focus when the viewer closes: the image's own button on the page (the one that opens it). */
  target: HTMLElement;
  /** Scrolled into view below the sticky header: the image with its description (a screenshot row, a figure). */
  area: HTMLElement;
  /**
   * Go to Description lands here: the heading (or label) that starts the text describing the image, focusable
   * (tabIndex -1). Its text starts just below the header, and it takes keyboard focus, so a screen reader reads on from
   * the description, not from the image again.
   */
  description: HTMLElement;
}

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
  /**
   * Finds the image's place on the page, read when the viewer closes on this image: closing lands there (the area in
   * view, focus on the target; Go to Description: its description from the top, focus on it), and the viewer shows Go
   * to Description. Without it, or when it finds nothing, focus goes back to the element that opened the viewer.
   */
  place?: () => LightboxPlace | null;
  /** Called when the visitor leaves the viewer for this image's description (Go to Description). */
  onGoToDescription?: () => void;
}

/**
 * Opens the image viewer at `index` of `items`. On close, focus goes to the shown item's place on the page
 * (LightboxItem.place) or else back to `trigger`.
 *   const openImage = useLightbox();
 *   openImage(items, index, triggerElement);
 */
export type OpenLightbox = (items: readonly LightboxItem[], index: number, trigger?: HTMLElement | null) => void;
