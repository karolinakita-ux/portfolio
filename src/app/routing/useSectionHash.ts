import { useEffect } from "react";

import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";
import { replaceAddress } from "#shared/lib/routes/address.utils.ts";
import { urlWithAnchor } from "#shared/lib/routes/routes.utils.ts";

import { READING_LINE } from "./section-hash.constants.ts";

/**
 * Keeps the URL hash on the section being read (/about#career), so the address bar
 * always holds a link to the current spot. Replaces the address (replaceAddress): no history
 * entries, no scroll jumps, and not a new page for the statistics. Above the first anchored section the hash is cleared.
 * Sections opt in with `data-anchor` (see shared/ui/Section).
 * `routeKey` re-collects the sections after every navigation.
 * Off in in-app browsers (Messenger, LinkedIn...): they show a loading bar on every history write.
 */
export function useSectionHash(routeKey: number): void {
  useEffect(() => {
    if (inAppBrowser(navigator.userAgent) !== null) return undefined;
    const sections = [...document.querySelectorAll<HTMLElement>("main section[data-anchor][id]")];
    if (sections.length === 0) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top > line) break;
        current = section.id;
      }
      const { pathname, search, hash } = window.location;
      const next = urlWithAnchor(window.location, current);
      if (pathname + search + hash === next) return;
      try {
        replaceAddress(next);
      } catch {
        /* sandboxed frames */
      }
    };

    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [routeKey]);
}
