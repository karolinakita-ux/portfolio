import { useRef, type TouchEvent } from "react";

import type { TouchPoint } from "#features/image-viewer/lightbox.types.ts";
import { isSwipe } from "#features/image-viewer/lightbox.utils.ts";

/**
 * Swipe left / right on a touch screen: `onSwipe(1)` for the next image, `onSwipe(-1)` for the previous.
 * Ignored while `enabled` is false (one image, or zoomed: the pane scrolls) and while the page is
 * pinch-zoomed (the swipe pans the page). Returns the touch handlers for the swipe area.
 */
export function useSwipe(onSwipe: (direction: 1 | -1) => void, enabled: boolean) {
  const startRef = useRef<TouchPoint | null>(null);

  return {
    onTouchStart: (event: TouchEvent<HTMLElement>) => {
      const touch = event.touches[0];
      startRef.current = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
    },
    onTouchEnd: (event: TouchEvent<HTMLElement>) => {
      const start = startRef.current;
      const touch = event.changedTouches[0];
      startRef.current = null;
      if (!start || !touch || !enabled || (window.visualViewport?.scale ?? 1) > 1.01) return;
      const dx = touch.clientX - start.x;
      if (!isSwipe(dx, touch.clientY - start.y)) return; // Too short, or mostly vertical.
      onSwipe(dx < 0 ? 1 : -1);
    },
    onTouchCancel: () => {
      startRef.current = null;
    },
  };
}
