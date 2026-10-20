import { useEffect } from "react";

import { urlWithAnchor } from "#shared/lib/routes/routes.utils.ts";

import { IN_APP_BROWSER, READING_LINE } from "./section-hash.constants.ts";

/**
 * Keeps the URL hash on the section being read (/about#career), so the address bar
 * always holds a link to the current spot. Uses replaceState: no history entries, no
 * scroll jumps. Above the first anchored section the hash is cleared.
 * Sections opt in with `data-anchor` (see shared/ui/Section).
 * `routeKey` re-collects the sections after every navigation.
 * Off in in-app browsers (Messenger, LinkedIn...): they show a loading bar on every history write.
 */
export function useSectionHash(routeKey: number): void {
  useEffect(() => {
    if (IN_APP_BROWSER.test(navigator.userAgent)) return undefined;
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
        window.history.replaceState(window.history.state, "", next);
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
