export interface LightboxItem {
  src: string;
  alt: string;
  title: string;
  /** Pixel size, when known: the viewer shows a placeholder of this shape while the image loads. */
  width?: number;
  height?: number;
  /** Called when the viewer moves to this image (arrow, key or swipe), not when it opens on it. */
  onShow?: (direction: "prev" | "next") => void;
}

/**
 * Opens the image viewer at `index` of `items`; `trigger` gets focus back on close.
 *   const openImage = useLightbox();
 *   openImage(items, index, triggerElement);
 */
export type OpenLightbox = (items: readonly LightboxItem[], index: number, trigger?: HTMLElement | null) => void;
