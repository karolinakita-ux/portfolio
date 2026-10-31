/** Which way the visitor zoomed an image in the viewer. */
export type ZoomDirection = "in" | "out";

/** How the visitor zoomed: a click on the image, a zoom button, or a key (+, -, 0). */
export type ZoomMethod = "click" | "button" | "key";

export interface LightboxItem {
  src: string;
  alt: string;
  title: string;
  /** Pixel size, when known: the viewer shows a placeholder of this shape while the image loads. */
  width?: number;
  height?: number;
  /** Called when the viewer moves to this image (arrow, key or swipe), not when it opens on it. */
  onShow?: (direction: "prev" | "next") => void;
  /**
   * Called when the visitor zooms this image in or out (a click on it, a zoom button or a key), not when the viewer
   * goes back to fit by itself (another image, closing, a narrower window).
   */
  onZoom?: (direction: ZoomDirection, method: ZoomMethod) => void;
}

/**
 * Opens the image viewer at `index` of `items`; `trigger` gets focus back on close.
 *   const openImage = useLightbox();
 *   openImage(items, index, triggerElement);
 */
export type OpenLightbox = (items: readonly LightboxItem[], index: number, trigger?: HTMLElement | null) => void;
