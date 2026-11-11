import type { CarouselPosition } from "./carousel.types.ts";

/** The items of a carousel track: its direct children. */
const itemsOf = (track: HTMLElement): HTMLElement[] =>
  Array.from(track.children).filter((child) => child instanceof HTMLElement);

/** How far the track can scroll. */
const maxScroll = (track: HTMLElement): number => Math.max(0, track.scrollWidth - track.clientWidth);

/**
 * The item whose start is nearest the scroll position `left`. Offsets are measured from the first item, so the
 * track's own padding does not count.
 */
export function itemAt(track: HTMLElement, left: number): number {
  const items = itemsOf(track);
  const origin = items[0]?.offsetLeft ?? 0;
  let first = 0;
  let nearest = Number.POSITIVE_INFINITY;
  items.forEach((item, index) => {
    const distance = Math.abs(item.offsetLeft - origin - left);
    if (distance < nearest) {
      nearest = distance;
      first = index;
    }
  });
  return first;
}

/**
 * Where the track rests: the item whose start is nearest the scroll position, and whether the track has
 * reached its end (the last items may never reach the start, so the end is read from the scroll position).
 */
export function measureTrack(track: HTMLElement): CarouselPosition {
  return positionAt(track, track.scrollLeft);
}

/** Where the track will rest at scroll position `left`: a move's landing, known before the row gets there. */
export function positionAt(track: HTMLElement, left: number): CarouselPosition {
  return { first: itemAt(track, left), atEnd: left >= maxScroll(track) - 2 };
}

/**
 * How far the track can still scroll towards each end, in px. The edge fade (`fade-scroll-edges` in
 * utilities.css) covers that much of each edge, at most 24px, so an edge fades while there is more that way:
 * at the start only the end, in the middle both, at the end only the start. It grows and shrinks over the first
 * and last 24px of the scroll instead of switching on and off.
 */
export function scrollRoom(track: HTMLElement): { start: number; end: number } {
  const left = Math.max(0, track.scrollLeft);
  return { start: left, end: Math.max(0, maxScroll(track) - left) };
}

/** Hands scrollRoom to the track's edge fade as `--kb-fade-start` and `--kb-fade-end`. */
export function paintEdgeFades(track: HTMLElement): void {
  const { start, end } = scrollRoom(track);
  track.style.setProperty("--kb-fade-start", `${String(start)}px`);
  track.style.setProperty("--kb-fade-end", `${String(end)}px`);
}

/** The items in view as the carousel shows them: “3 - 4”, or “2” when one item shows (1-based). */
export const carouselRange = (first: number, last: number): string =>
  first === last ? String(first) : `${String(first)} - ${String(last)}`;

/** The scroll position that brings item `index` to the start, held within the track. */
export function scrollTarget(track: HTMLElement, index: number): number {
  const items = itemsOf(track);
  const item = items[Math.min(Math.max(index, 0), items.length - 1)];
  const origin = items[0]?.offsetLeft ?? 0;
  return item ? Math.min(item.offsetLeft - origin, maxScroll(track)) : 0;
}
