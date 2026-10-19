import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject, type UIEvent } from "react";

import { MAX_ZOOM_STEP, ZOOM_QUERY, ZOOM_STEPS } from "#features/image-viewer/lightbox.constants.ts";
import type { DragStart, ScrollCenter, ZoomState } from "#features/image-viewer/lightbox.types.ts";
import { canZoom, readCenter, scrollToCenter } from "#features/image-viewer/lightbox.utils.ts";

interface UseZoomOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  /** Gets focus when the zoom controls hide (window narrowed below md) while the pane had it. */
  closeRef: RefObject<HTMLButtonElement | null>;
  /** Gets focus when zooming back to fit makes the pane unfocusable. */
  zoomInRef: RefObject<HTMLButtonElement | null>;
  loaded: boolean;
}

/**
 * Zoom (md and up; phones pinch-zoom natively) in ZOOM_STEPS. Zoomed, the image pane scrolls:
 * drag with the mouse, use the trackpad or scroll wheel, or focus the pane and use the arrow keys.
 * The zoomed width is computed in CSS, so it follows resizes, and the point in the middle of the
 * pane stays there across zoom and resize. Narrowing the window below md resets to fit.
 */
export function useZoom({ viewportRef, imageRef, closeRef, zoomInRef, loaded }: UseZoomOptions) {
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  // Point to keep in the middle of the pane: set on zoom, kept current by scrolling and dragging.
  const centerRef = useRef<ScrollCenter>({ x: 0.5, y: 0.5 });
  const dragRef = useRef<DragStart | null>(null);
  const zoomStep = zoom?.step ?? 0;
  const zoomLevel = ZOOM_STEPS[zoomStep] ?? 1;
  const isZoomed = zoom !== null;

  // After a zoom change, scroll so the same point stays in the middle of the pane.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) scrollToCenter(viewport, centerRef.current);
  }, [viewportRef, zoomStep]);

  // Same after a window resize: the pane and the zoomed image change size together.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!isZoomed || !viewport || typeof ResizeObserver !== "function") return undefined;
    const observer = new ResizeObserver(() => scrollToCenter(viewport, centerRef.current));
    observer.observe(viewport);
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [imageRef, isZoomed, viewportRef]);

  // The zoom controls hide below md: drop back to fit when the window narrows.
  useEffect(() => {
    if (!isZoomed || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia(ZOOM_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) return;
      // The zoom controls are hidden now: keep focus in the dialog on Close.
      if (document.activeElement === viewportRef.current) closeRef.current?.focus();
      setZoom(null);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [closeRef, isZoomed, viewportRef]);

  const zoomTo = (target: number) => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const next = Math.min(Math.max(target, 0), MAX_ZOOM_STEP);
    if (!viewport || !image || !loaded || next === zoomStep) return;
    if (next === 0) {
      // Back to fit makes the pane unfocusable; move focus first so it does not drop to the page (WCAG 2.4.3).
      if (document.activeElement === viewport) zoomInRef.current?.focus();
      setZoom(null);
      return;
    }
    if (!canZoom() || !image.naturalWidth || !image.naturalHeight) return; // Small touch screen, or not loaded yet.
    centerRef.current = readCenter(viewport);
    setZoom({ step: next, aspect: image.naturalWidth / image.naturalHeight, naturalWidth: image.naturalWidth });
  };

  const resetZoom = () => setZoom(null);

  // Drag to pan the zoomed image (mouse only; touch and trackpads scroll natively).
  const endDrag = () => {
    dragRef.current = null;
  };

  const paneHandlers = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!zoom || !viewport || event.pointerType !== "mouse" || event.button !== 0) return;
      viewport.setPointerCapture(event.pointerId);
      dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      const drag = dragRef.current;
      if (!viewport || !drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      viewport.scrollTop = drag.top - (event.clientY - drag.y);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onScroll: (event: UIEvent<HTMLDivElement>) => {
      if (zoom) centerRef.current = readCenter(event.currentTarget);
    },
  };

  return { zoom, zoomStep, zoomLevel, zoomTo, resetZoom, paneHandlers };
}
