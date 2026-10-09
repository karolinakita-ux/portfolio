import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn, FOCUS_RING } from "../../lib/ui.ts";
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn, ZoomOut } from "../icons.tsx";
import { IconButton } from "../ui/Button.tsx";
import { LightboxContext, type LightboxItem, type OpenLightbox } from "./lightbox-context.ts";

/**
 * Full-size image viewer for case-study screenshots.
 *
 * Built on the native <dialog> (showModal): the page behind becomes inert,
 * Escape closes it, and focus stays inside. On close, focus returns to the
 * screenshot that opened it. Page scroll is locked while it is open.
 * Open it with useLightbox() from ./lightbox-context.ts.
 *
 * Controls: close button, Escape, click on the dimmed backdrop; with more than
 * one image, Previous / Next buttons and the ← / → keys (wrapping around).
 *
 * Zoom (md and up; phones pinch-zoom natively): Zoom out / Zoom in buttons and
 * the + / - / 0 keys step through ZOOM_STEPS. Zoomed, the image pane scrolls:
 * drag with the mouse, use the trackpad or scroll wheel, or focus the pane and
 * use the arrow keys. Changing image, closing, or narrowing the window below
 * md resets to fit. The zoomed width is computed in CSS, so it follows resizes,
 * and the point in the middle of the pane stays there across zoom and resize.
 */

/** Zoom levels as multiples of the fitted width; index 0 is "fit to the viewer". */
const ZOOM_STEPS = [1, 1.5, 2, 3, 4] as const;

/** Zoom is a desktop feature (the md breakpoint); below it the viewer always fits. */
const ZOOM_QUERY = "(min-width: 768px)";
const canZoom = () => typeof window.matchMedia !== "function" || window.matchMedia(ZOOM_QUERY).matches;

interface ZoomState {
  step: number;
  /** Intrinsic size of the image: app.css derives the fitted width from it, so zoom follows window resizes. */
  aspect: number;
  naturalWidth: number;
}

/** The point in the middle of a scroll pane, as fractions of its scroll size. */
interface ScrollCenter {
  x: number;
  y: number;
}

const readCenter = (pane: HTMLElement): ScrollCenter => ({
  x: (pane.scrollLeft + pane.clientWidth / 2) / (pane.scrollWidth || 1),
  y: (pane.scrollTop + pane.clientHeight / 2) / (pane.scrollHeight || 1),
});

const scrollToCenter = (pane: HTMLElement, center: ScrollCenter) => {
  pane.scrollLeft = center.x * pane.scrollWidth - pane.clientWidth / 2;
  pane.scrollTop = center.y * pane.scrollHeight - pane.clientHeight / 2;
};

interface LightboxState {
  items: ReadonlyArray<LightboxItem>;
  index: number;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenLightbox>((items, index, trigger) => {
    if (!items.length) return;
    triggerRef.current = trigger ?? null;
    setState({ items, index: Math.min(Math.max(index, 0), items.length - 1) });
  }, []);

  const handleClosed = useCallback(() => {
    setState(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    trigger?.focus({ preventScroll: true });
  }, []);

  const step = useCallback((delta: number) => {
    setState((current) =>
      current ? { ...current, index: (current.index + delta + current.items.length) % current.items.length } : current
    );
  }, []);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <LightboxDialog state={state} onClosed={handleClosed} onStep={step} />
    </LightboxContext.Provider>
  );
}

interface LightboxDialogProps {
  state: LightboxState | null;
  onClosed: () => void;
  onStep: (delta: number) => void;
}

function LightboxDialog({ state, onClosed, onStep }: LightboxDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  // Point to keep in the middle of the pane: set on zoom, kept current by scrolling and dragging.
  const centerRef = useRef<ScrollCenter>({ x: 0.5, y: 0.5 });
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const isOpen = state !== null;
  const item = state ? state.items[state.index] : undefined;
  const count = state ? state.items.length : 0;
  const failed = item !== undefined && failedSrc === item.src;
  const zoomStep = zoom?.step ?? 0;
  const zoomLevel = ZOOM_STEPS[zoomStep] ?? 1;
  const maxZoomStep = ZOOM_STEPS.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("kb-scroll-locked");
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Unlock scroll if the provider unmounts while open.
  useEffect(() => () => document.documentElement.classList.remove("kb-scroll-locked"), []);

  // After a zoom change, scroll so the same point stays in the middle of the pane.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) scrollToCenter(viewport, centerRef.current);
  }, [zoomStep]);

  // Same after a window resize: the pane and the zoomed image change size together.
  const isZoomed = zoom !== null;
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!isZoomed || !viewport || typeof ResizeObserver !== "function") return undefined;
    const observer = new ResizeObserver(() => scrollToCenter(viewport, centerRef.current));
    observer.observe(viewport);
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [isZoomed]);

  // The zoom controls hide below md: drop back to fit when the window narrows.
  useEffect(() => {
    if (!isZoomed || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia(ZOOM_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setZoom(null);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [isZoomed]);

  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  const handleClose = () => {
    document.documentElement.classList.remove("kb-scroll-locked");
    setZoom(null);
    onClosed();
  };

  const step = (delta: number) => {
    setZoom(null);
    onStep(delta);
  };

  const zoomTo = (target: number) => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const next = Math.min(Math.max(target, 0), maxZoomStep);
    if (!viewport || !image || failed || next === zoomStep) return;
    if (next === 0) {
      setZoom(null);
      return;
    }
    if (!canZoom() || !image.naturalWidth || !image.naturalHeight) return; // Phone width, or not loaded yet.
    centerRef.current = readCenter(viewport);
    setZoom({ step: next, aspect: image.naturalWidth / image.naturalHeight, naturalWidth: image.naturalWidth });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return; // Leave browser zoom alone.
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(zoomStep + 1);
    } else if (event.key === "-") {
      event.preventDefault();
      zoomTo(zoomStep - 1);
    } else if (event.key === "0") {
      event.preventDefault();
      zoomTo(0);
    } else if (count > 1 && event.target !== viewportRef.current) {
      // In the focused, zoomed pane the arrow keys scroll instead.
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    }
  };

  // Drag to pan the zoomed image (mouse only; touch and trackpads scroll natively).
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!zoom || !viewport || event.pointerType !== "mouse" || event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // A click that lands on the dialog element itself (not its panel) is a backdrop click.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className="kb-lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-md open:flex md:p-xl"
    >
      {state && item && (
        <figure className="flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl motion-safe:animate-view-in md:p-md">
          <div className="flex items-start justify-between gap-md">
            <div className="flex min-w-0 flex-col gap-3xs">
              {count > 1 && (
                <p className="text-label-md text-text-secondary">
                  {state.index + 1} / {count}
                </p>
              )}
              <h2 id={titleId} className="text-balance text-title-md text-text-primary">
                {item.title}
              </h2>
            </div>
            {/* First focusable element, so showModal() puts focus here. */}
            <IconButton label="Close image viewer" icon={X} onClick={close} />
          </div>

          <div
            ref={viewportRef}
            role={zoom ? "region" : undefined}
            aria-label={zoom ? "Zoomed image, scroll to pan" : undefined}
            tabIndex={zoom ? 0 : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onScroll={(event) => {
              if (zoom) centerRef.current = readCenter(event.currentTarget);
            }}
            className={cn(
              "min-h-0 rounded-sm border border-border-subtle bg-bg-surface-default",
              zoom
                ? cn("kb-lightbox-viewport cursor-grab overflow-auto overscroll-contain select-none active:cursor-grabbing", FOCUS_RING)
                : "flex items-center justify-center overflow-hidden"
            )}
          >
            {failed ? (
              <p className="flex items-center gap-xs p-xl text-body-md text-text-secondary">
                <ImageOff aria-hidden="true" size={16} />
                Image unavailable
              </p>
            ) : (
              <img
                key={item.src}
                ref={imageRef}
                src={item.src}
                alt={item.alt}
                decoding="async"
                draggable={false}
                onError={() => setFailedSrc(item.src)}
                style={
                  zoom
                    ? ({
                        "--kb-zoom": zoomLevel,
                        "--kb-aspect": zoom.aspect,
                        "--kb-natural-width": zoom.naturalWidth + "px",
                      } as CSSProperties)
                    : undefined
                }
                className={cn(
                  "block h-auto motion-safe:animate-view-in",
                  zoom ? "kb-lightbox-image-zoomed mx-auto max-w-none" : "kb-lightbox-image w-auto max-w-full object-contain"
                )}
              />
            )}
          </div>

          {/* Single image on a phone: no browse or zoom controls, so no toolbar. */}
          <div className={cn("flex items-center gap-md", count > 1 ? "justify-between" : "hidden justify-center md:flex")}>
            {count > 1 && <IconButton label="Previous image" icon={ChevronLeft} onClick={() => step(-1)} />}
            <div className="flex items-center gap-md">
              <div role="group" aria-label="Zoom" className="hidden items-center gap-xs md:flex">
                <IconButton
                  label="Zoom out"
                  title="Zoom out (-)"
                  aria-keyshortcuts="-"
                  icon={ZoomOut}
                  aria-disabled={zoomStep === 0 || failed}
                  onClick={() => zoomTo(zoomStep - 1)}
                />
                <p aria-live="polite" className="w-2xl text-center text-label-md text-text-secondary tabular-nums">
                  {zoom ? `${zoomLevel * 100}%` : "Fit"}
                </p>
                <IconButton
                  label="Zoom in"
                  title="Zoom in (+)"
                  aria-keyshortcuts="+"
                  icon={ZoomIn}
                  aria-disabled={zoomStep === maxZoomStep || failed}
                  onClick={() => zoomTo(zoomStep + 1)}
                />
              </div>
              {count > 1 && <p className="hidden text-body-sm text-text-secondary sm:block">Use ← and → to browse</p>}
            </div>
            {count > 1 && <IconButton label="Next image" icon={ChevronRight} onClick={() => step(1)} />}
          </div>

          <p className="sr-only" aria-live="polite">
            {count > 1 ? `Image ${state.index + 1} of ${count}: ${item.title}` : item.title}
          </p>
        </figure>
      )}
    </dialog>
  );
}
