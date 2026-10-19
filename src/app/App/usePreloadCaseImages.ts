import { useEffect } from "react";

import { caseCards } from "#features/case-studies/index.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";

import { ALL_CASES } from "./App.constants.tsx";

/**
 * Once the first page has loaded, fetches every case study's full screenshots in the background,
 * so the image viewer opens at once. The open case study queues its own first (useCaseGallery).
 */
export function usePreloadCaseImages(resolveAsset: (name: string) => string): void {
  useEffect(() => {
    preloadImages(ALL_CASES.flatMap((c) => caseCards(c).map((card) => resolveAsset(card.asset))));
  }, [resolveAsset]);
}
