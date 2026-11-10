import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import type { CarouselPosition } from "./carousel.types.ts";
import { itemAt, measureTrack, scrollTarget } from "./carousel.utils.ts";

/** From tablet width up the track shows 2 items, below it 1 (Carousel.styles.ts sizes them the same way). */
const WIDE = "(width >= 48rem)";
/** Quiet time after the last scroll event before the position counts as settled. */
const SETTLE_MS = 120;

/** Media queries, where the browser has them (jsdom does not). */
const wideQuery = (): MediaQueryList | null =>
  typeof window.matchMedia === "function" ? window.matchMedia(WIDE) : null;

const subscribeWide = (onChange: () => void) => {
  const query = wideQuery();
  query?.addEventListener("change", onChange);
  return () => query?.removeEventListener("change", onChange);
};
const readWide = () => wideQuery()?.matches ?? true;
/** The prerendered page assumes the wide layout; a phone corrects it right after hydration. */
const readWideOnServer = () => true;

/**
 * State for a manual carousel (Carousel + CarouselControls): which items are in view, and Previous / Next
 * moves of one view. It never moves on its own. The position is read from the track once scrolling settles,
 * so a swipe, a button and Tab onto a card's link all update it the same way. `announce` is true only when
 * Previous or Next made the move, so the screen reader status speaks after a button and never on load, after a
 * swipe or after Tab (each of those already says where the reader is). A second press during a move goes on
 * from where the first one lands, not from where the row was.
 * Destructure the result: it holds the track's ref.
 */
export function useCarousel(count: number) {
  const perView = useSyncExternalStore(subscribeWide, readWide, readWideOnServer) ? 2 : 1;
  const trackRef = useRef<HTMLUListElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<CarouselPosition>({ first: 0, atEnd: false });
  const [announce, setAnnounce] = useState(false);
  /** Where a Previous / Next move in flight lands (item index), until the scroll settles. */
  const landingRef = useRef<number | null>(null);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const onScroll = () => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      setPosition(measureTrack(track));
      setAnnounce(landingRef.current !== null);
      landingRef.current = null;
    }, SETTLE_MS);
  };

  /** Scrolls one view on; returns the 1-based items in view where it lands (for the statistics). */
  const go = (direction: -1 | 1): { first: number; last: number } | null => {
    const track = trackRef.current;
    if (!track) return null;
    const from = landingRef.current ?? position.first;
    const left = scrollTarget(track, from + direction * perView);
    const landing = itemAt(track, left);
    // A move that goes nowhere (already at the end) sends no scroll event, so nothing would settle it.
    landingRef.current = Math.abs(left - track.scrollLeft) < 1 ? null : landing;
    track.scrollTo({ left, behavior: prefersReducedMotion() ? "instant" : "smooth" });
    return { first: landing + 1, last: Math.min(landing + perView, count) };
  };

  const last = Math.min(position.first + perView, count);
  return {
    trackRef,
    onScroll,
    /** 1-based numbers of the first and last item in view. */
    first: position.first + 1,
    last,
    count,
    atStart: position.first === 0,
    atEnd: position.atEnd || last >= count,
    /** False while every item fits in view: the controls then have nothing to do. */
    scrollable: count > perView,
    announce,
    previous: () => go(-1),
    next: () => go(1),
  };
}
