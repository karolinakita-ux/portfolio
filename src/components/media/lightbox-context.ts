import { createContext, useContext } from "react";

export interface LightboxItem {
  src: string;
  alt: string;
  title: string;
}

/**
 * Opens the image viewer at `index` of `items`; `trigger` gets focus back on close.
 *   const openImage = useLightbox();
 *   openImage(items, index, triggerElement);
 */
export type OpenLightbox = (items: ReadonlyArray<LightboxItem>, index: number, trigger?: HTMLElement | null) => void;

export const LightboxContext = createContext<OpenLightbox>(() => {});

export const useLightbox = (): OpenLightbox => useContext(LightboxContext);
