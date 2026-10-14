import { useEffect } from "react";

import { urlWithAnchor } from "#shared/lib/routes.ts";

/** A section counts as "current" once its top passes this share of the viewport height. */
const READING_LINE = 0.3;

/**
 * Keeps the URL hash on the section being read (/about#career), so the address bar
 * always holds a link to the current spot. Uses replaceState: no history entries, no
 * scroll jumps. Above the first anchored section the hash is cleared.
 * Sections opt in with `data-anchor` (see Section in shared/ui/layout.tsx).
 * `routeKey` re-collects the sections after every navigation.
 */
export function useSectionHash(routeKey: number): void {
  useEffect(() => {
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
