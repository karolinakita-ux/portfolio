import { useEffect } from "react";

import type { LightboxState } from "#features/image-viewer/lightbox.types.ts";
import { neighbourSources } from "#features/image-viewer/lightbox.utils.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";

/** Loads the images either side of the current one, so Previous / Next show them at once. */
export function usePreloadNeighbours(state: LightboxState | null): void {
  useEffect(() => {
    if (!state || state.items.length < 2) return;
    preloadImages(neighbourSources(state.items, state.index), { urgent: true });
  }, [state]);
}
