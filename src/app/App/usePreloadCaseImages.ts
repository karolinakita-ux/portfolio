import { useEffect } from "react";

import { caseCards } from "#features/case-studies/index.ts";
import { readRoute } from "#shared/lib/routes/routes.utils.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";

import { ALL_CASES } from "./App.constants.tsx";

/**
 * Fetches a case study's full screenshots in the background as soon as the visitor shows interest
 * in it: the pointer moves over, or keyboard focus reaches, a link to that case (a Work card, the
 * next-case link). The image viewer then opens at once, while a visitor who only reads the Work
 * page no longer downloads every screenshot (about 2.6 MB). The open case study queues its own
 * screenshots on arrival (useCaseGallery). Links are read with readRoute, so the artifact's hash
 * links (#/work/meetestim) count too.
 */
export function usePreloadCaseImages(resolveAsset: (name: string) => string): void {
  useEffect(() => {
    const queued = new Set<string>();
    const onIntent = (event: Event) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      const { view } = readRoute({ pathname: url.pathname, hash: url.hash });
      const study = ALL_CASES.find((c) => c.view === view);
      if (!study || queued.has(study.view)) return;
      queued.add(study.view);
      preloadImages(caseCards(study).map((card) => resolveAsset(card.asset)));
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [resolveAsset]);
}
