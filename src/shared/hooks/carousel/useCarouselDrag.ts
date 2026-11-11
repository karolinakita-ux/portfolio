import { useEffect, type RefObject } from "react";

import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { DRAG_NUDGE_PX, DRAG_START_PX, DRAG_STATE, SETTLE_MS } from "./carousel.constants.ts";
import type { CarouselPosition } from "./carousel.types.ts";
import { itemAt, positionAt, scrollTarget } from "./carousel.utils.ts";

/**
 * Lets a mouse drag a carousel's row, as a finger swipes it: the row follows the pointer 1:1 and, on release,
 * glides to the nearest whole item as Previous and Next do (at once with reduced motion). A drag of
 * DRAG_NUDGE_PX or more moves on by at least one item. Touch and pens keep the browser's own swipe. A press stays
 * a click until the mouse moves DRAG_START_PX sideways; the click that ends a drag is swallowed, so a drag that
 * ends on a link does not open it. Snapping is off while the row follows the mouse and until the glide settles,
 * or the browser would pull it to a snap point under the pointer. Only while `enabled` (the row can scroll).
 * `onLand` hears where the row will rest as soon as the mouse lets go (keep it stable: useCallback).
 */
export function useCarouselDrag(
  trackRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onLand: (position: CarouselPosition) => void,
): void {
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !enabled) return undefined;
    let press: { pointer: number; x: number; left: number; from: number } | null = null;
    let dragging = false;
    let swallowClick = false;
    let settleTimer: number | undefined;
    track.dataset.drag = DRAG_STATE.idle;

    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      const left = track.scrollLeft;
      press = { pointer: event.pointerId, x: event.clientX, left, from: itemAt(track, left) };
    };
    const move = (event: PointerEvent) => {
      if (press?.pointer !== event.pointerId) return;
      // The button came up where the page could not see it (outside the window): the drag is over.
      if ((event.buttons & 1) === 0) {
        up(event);
        return;
      }
      const dx = event.clientX - press.x;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_START_PX) return;
        dragging = true;
        window.clearTimeout(settleTimer);
        track.dataset.drag = DRAG_STATE.active;
        track.setPointerCapture(event.pointerId);
      }
      // A press on text starts a selection before it turns into a drag.
      window.getSelection()?.removeAllRanges();
      track.scrollLeft = press.left - dx;
    };
    const up = (event: PointerEvent) => {
      if (press?.pointer !== event.pointerId) return;
      const { left: startLeft, from } = press;
      press = null;
      if (!dragging) return;
      dragging = false;
      // The click that follows this release (same task) is the drag's own; a later one is a real click.
      swallowClick = true;
      window.setTimeout(() => {
        swallowClick = false;
      });
      const moved = track.scrollLeft - startLeft;
      let landing = itemAt(track, track.scrollLeft);
      if (landing === from && Math.abs(moved) >= DRAG_NUDGE_PX) landing += Math.sign(moved);
      const left = scrollTarget(track, landing);
      onLand(positionAt(track, left));
      if (Math.abs(left - track.scrollLeft) < 1) {
        track.dataset.drag = DRAG_STATE.idle;
        return;
      }
      track.dataset.drag = DRAG_STATE.settling;
      track.scrollTo({ left, behavior: prefersReducedMotion() ? "instant" : "smooth" });
    };
    const scrolled = () => {
      if (track.dataset.drag !== DRAG_STATE.settling) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        track.dataset.drag = DRAG_STATE.idle;
      }, SETTLE_MS);
    };
    const click = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    /** Links would start the browser's own drag and drop, which takes the pointer away from the row. */
    const noNativeDrag = (event: DragEvent) => {
      event.preventDefault();
    };

    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("scroll", scrolled, { passive: true });
    track.addEventListener("click", click, true);
    track.addEventListener("dragstart", noNativeDrag);
    return () => {
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("scroll", scrolled);
      track.removeEventListener("click", click, true);
      track.removeEventListener("dragstart", noNativeDrag);
      window.clearTimeout(settleTimer);
      track.removeAttribute("data-drag");
    };
  }, [trackRef, enabled, onLand]);
}
