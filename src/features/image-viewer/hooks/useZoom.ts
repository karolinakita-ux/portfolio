import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  type UIEvent,
} from "react";

import { CLICK_ZOOM_STEP, MAX_ZOOM_STEP, ZOOM_QUERY, ZOOM_STEPS } from "#features/image-viewer/lightbox.constants.ts";
import type {
  DragStart,
  MousePress,
  ScrollCenter,
  ZoomAnchor,
  ZoomState,
} from "#features/image-viewer/lightbox.types.ts";
import {
  anchorAt,
  canZoom,
  readCenter,
  scrollToAnchor,
  scrollToCenter,
  travelledFar,
} from "#features/image-viewer/lightbox.utils.ts";
import type { ZoomDirection, ZoomMethod } from "#shared/media/lightbox/lightbox.types.ts";

interface UseZoomOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  /** Gets focus when the zoom controls hide (window narrowed below md) while the pane had it. */
  closeRef: RefObject<HTMLButtonElement | null>;
  /** Gets focus when zooming back to fit makes the pane unfocusable. */
  zoomInRef: RefObject<HTMLButtonElement | null>;
  loaded: boolean;
  /** The visitor zoomed in or out (a click, a button or a key); not called when the viewer resets to fit by itself. */
  onZoom?: (direction: ZoomDirection, method: ZoomMethod) => void;
}

/**
 * Zoom (md and up; phones pinch-zoom natively) in ZOOM_STEPS. Zoomed, the image pane scrolls:
 * drag with the mouse, use the trackpad or scroll wheel, or focus the pane and use the arrow keys.
 * The zoomed width is computed in CSS, so it follows resizes, and the point in the middle of the
 * pane stays there across zoom and resize. Narrowing the window below md resets to fit.
 *
 * A mouse click on the fitted image zooms to CLICK_ZOOM_STEP with the clicked point kept under the
 * pointer; a click on the zoomed image goes back to fit. Each way the zoomed image is still smaller than
 * the pane (the height of a wide screenshot), it stays centred, as when fitted, so that way only a point
 * on the image's middle line stays exactly under the pointer. A press that travels (a drag to pan) is not
 * a click, and a tap or a pen does nothing: touch screens keep their own pinch-zoom and swipes.
 * Zoom is instant, so there is nothing to shorten for reduced motion.
 */
export function useZoom({ viewportRef, imageRef, closeRef, zoomInRef, loaded, onZoom }: UseZoomOptions) {
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const [dragging, setDragging] = useState(false);
  // Point to keep in the middle of the pane: set on zoom, kept current by scrolling and dragging.
  const centerRef = useRef<ScrollCenter>({ x: 0.5, y: 0.5 });
  // A click that zoomed in: the point to keep under the pointer instead.
  const anchorRef = useRef<ZoomAnchor | null>(null);
  const dragRef = useRef<DragStart | null>(null);
  const pressRef = useRef<MousePress | null>(null);
  const zoomStep = zoom?.step ?? 0;
  const zoomLevel = ZOOM_STEPS[zoomStep] ?? 1;
  const isZoomed = zoom !== null;

  // After a zoom change, scroll so the same point stays in the middle of the pane (or under the pointer that clicked).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (!viewport) return;
    if (!anchor || !image) {
      scrollToCenter(viewport, centerRef.current);
      return;
    }
    scrollToAnchor(viewport, image, anchor);
    centerRef.current = readCenter(viewport);
    // Keys keep working after a click on the image: + / - / 0 reach the viewer, the arrow keys pan.
    viewport.focus({ preventScroll: true });
  }, [imageRef, viewportRef, zoomStep]);

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

  /** Zooms to `target` (an index in ZOOM_STEPS) and reports it; `anchor`: the point a click zoomed in on. */
  const zoomTo = (target: number, method: ZoomMethod, anchor?: ZoomAnchor) => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const next = Math.min(Math.max(target, 0), MAX_ZOOM_STEP);
    if (!viewport || !image || !loaded || next === zoomStep) return;
    if (next === 0) {
      // Back to fit makes the pane unfocusable; move focus first so it does not drop to the page (WCAG 2.4.3).
      if (document.activeElement === viewport) zoomInRef.current?.focus();
      setZoom(null);
      onZoom?.("out", method);
      return;
    }
    if (!canZoom() || !image.naturalWidth || !image.naturalHeight) return; // Small touch screen, or not loaded yet.
    centerRef.current = readCenter(viewport);
    anchorRef.current = anchor ?? null;
    setZoom({ step: next, aspect: image.naturalWidth / image.naturalHeight, naturalWidth: image.naturalWidth });
    onZoom?.(next > zoomStep ? "in" : "out", method);
  };

  const resetZoom = () => setZoom(null);

  // Drag to pan the zoomed image (mouse only; touch and trackpads scroll natively).
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const paneHandlers = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      const mouse = event.pointerType === "mouse" && event.button === 0;
      // Only a mouse press can become a click that zooms: a tap or a pen leaves the zoom alone.
      pressRef.current = mouse
        ? { x: event.clientX, y: event.clientY, onImage: event.target === imageRef.current, moved: false }
        : null;
      if (!zoom || !viewport || !mouse) return;
      viewport.setPointerCapture(event.pointerId);
      dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const press = pressRef.current;
      const drag = dragRef.current;
      if (press && !press.moved && travelledFar(press, event.clientX, event.clientY)) {
        press.moved = true;
        if (drag) setDragging(true);
      }
      const viewport = viewportRef.current;
      if (!viewport || !drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      viewport.scrollTop = drag.top - (event.clientY - drag.y);
    },
    onPointerUp: endDrag,
    onPointerCancel: () => {
      pressRef.current = null;
      endDrag();
    },
    // A mouse shortcut: the keyboard has + / - / 0 and the zoom buttons (handleKeyDown, LightboxToolbar).
    onClick: (event: MouseEvent<HTMLDivElement>) => {
      const press = pressRef.current;
      pressRef.current = null;
      // Not a press made with the mouse on the image (a tap, a key, the empty pane), or a drag.
      if (!press?.onImage || event.detail === 0 || press.moved || travelledFar(press, event.clientX, event.clientY))
        return;
      const viewport = viewportRef.current;
      const image = imageRef.current;
      if (zoom) zoomTo(0, "click");
      else if (viewport && image)
        zoomTo(CLICK_ZOOM_STEP, "click", anchorAt(event.clientX, event.clientY, image, viewport));
    },
    onScroll: (event: UIEvent<HTMLDivElement>) => {
      if (zoom) centerRef.current = readCenter(event.currentTarget);
    },
  };

  return { zoom, zoomStep, zoomLevel, dragging, zoomTo, resetZoom, paneHandlers };
}
