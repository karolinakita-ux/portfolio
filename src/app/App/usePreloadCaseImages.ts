import { useEffect } from "react";

import { caseCards } from "#features/case-studies/index.ts";
import { readDocumentTheme } from "#shared/hooks/theme/theme.utils.ts";
import { readRoute } from "#shared/lib/routes/routes.utils.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { pickThemedSrc } from "#shared/media/themed-image/themed-image.utils.ts";

import { ALL_CASES } from "./App.constants.tsx";

/**
 * Fetches a case study's full screenshots in the background as soon as the visitor shows interest
 * in it: the pointer moves over, or keyboard focus reaches, a link to that case (a Work card, the
 * next-case link). The image viewer then opens at once, while a visitor who only reads the Work
 * page no longer downloads every screenshot (about 6 MB per theme). The open case study queues its own
 * screenshots on arrival (useCaseGallery). Links are read with readRoute, so the artifact's hash
 * links (#/work/automotive) count too. It fetches the files of the theme the page shows then, as the
 * case study does: the Dark ones in Dark mode, where a screen has them.
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
      const theme = readDocumentTheme();
      if (!study || queued.has(study.view + " " + theme)) return;
      queued.add(study.view + " " + theme);
      preloadImages(caseCards(study).map((card) => resolveAsset(pickThemedSrc(theme, card.asset, card.darkAsset))));
    };
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, [resolveAsset]);
}
