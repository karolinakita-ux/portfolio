import { createContext, useContext } from "react";

import type { OpenLightbox } from "./lightbox.types.ts";

/** Provided by the image viewer (features/image-viewer); opens it from anywhere in the app. */
export const LightboxContext = createContext<OpenLightbox>(() => undefined);

export const useLightbox = (): OpenLightbox => useContext(LightboxContext);
