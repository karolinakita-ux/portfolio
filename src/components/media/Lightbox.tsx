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
  type SyntheticEvent,
  type TouchEvent,
} from "react";
import { useImageStatus } from "../../hooks/useImageStatus.ts";
import { preloadImages } from "../../lib/imagePreload.ts";
import { cn, FOCUS_RING } from "../../lib/ui.ts";
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn, ZoomOut } from "../icons.tsx";
import { IconButton } from "../ui/Button.tsx";
import { ThumbnailScaffold } from "./images.tsx";
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
 * one image, Previous / Next buttons, the ← / → keys and, on touch screens,
 * a swipe left / right (all wrapping around).
 *
 * Loading: the neighbouring images load ahead (lib/imagePreload.ts). An image
 * that is not in the cache yet shows a skeleton of its own size and shape
 * (item.width / item.height) until it is decoded; zoom waits for it.
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

/**
 * Zoom needs the md breakpoint or a mouse / trackpad. Phones and small touch screens fit and keep their own
 * pinch-zoom; a desktop browser zoomed to 200-400% (a narrow viewport) keeps the zoom controls (WCAG 1.4.4, 1.4.10).
 */
const ZOOM_QUERY = "(min-width: 768px), (pointer: fine)";
/** Shortest horizontal finger travel, in px, that counts as a swipe. */
const SWIPE_MIN_DISTANCE = 50;

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
  /** Last move: 1 next, -1 previous, 0 just opened. Picks the image's entry animation. */
  direction: 1 | -1 | 0;
}

const IMAGE_ENTRY = {
  1: "motion-safe:animate-slide-in-next",
  [-1]: "motion-safe:animate-slide-in-prev",
  0: "motion-safe:animate-view-in",
} as const;

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenLightbox>((items, index, trigger) => {
    if (!items.length) return;
    triggerRef.current = trigger ?? null;
    setState({ items, index: Math.min(Math.max(index, 0), items.length - 1), direction: 0 });
  }, []);

  const handleClosed = useCallback(() => {
    setState(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    trigger?.focus({ preventScroll: true });
  }, []);

  const step = useCallback((delta: number) => {
    setState((current) =>
      current
        ? {
            ...current,
            index: (current.index + delta + current.items.length) % current.items.length,
            direction: delta > 0 ? 1 : -1,
          }
        : current,
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const zoomInRef = useRef<HTMLButtonElement>(null);
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  // Point to keep in the middle of the pane: set on zoom, kept current by scrolling and dragging.
  const centerRef = useRef<ScrollCenter>({ x: 0.5, y: 0.5 });
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const isOpen = state !== null;
  const item = state ? state.items[state.index] : undefined;
  const count = state ? state.items.length : 0;
  const { status: imageStatus, setStatus: setImageStatus, ref: imageStatusRef } = useImageStatus(item?.src ?? "");
  const failed = item !== undefined && imageStatus === "error";
  const loaded = imageStatus === "loaded";
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

  // Load the images either side, so Previous / Next show them at once.
  useEffect(() => {
    if (!state || state.items.length < 2) return;
    const { items, index } = state;
    const near = new Set<string>();
    for (const offset of [1, -1, 2]) {
      const src = items[(index + offset + items.length) % items.length]?.src;
      if (src !== undefined && src !== items[index]?.src) near.add(src);
    }
    preloadImages([...near], { urgent: true });
  }, [state]);

  const setImage = useCallback(
    (image: HTMLImageElement | null) => {
      imageRef.current = image;
      imageStatusRef(image);
    },
    [imageStatusRef],
  );

  // Reveal the image once it is decoded, so the skeleton does not give way to an empty frame.
  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const reveal = () => {
      if (imageRef.current === image) setImageStatus("loaded"); // Not if the visitor moved on meanwhile.
    };
    if (typeof image.decode === "function") image.decode().then(reveal, reveal);
    else reveal();
  };

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
      if (event.matches) return;
      // The zoom controls are hidden now: keep focus in the dialog on Close.
      if (document.activeElement === viewportRef.current) closeRef.current?.focus();
      setZoom(null);
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

  // Swipe left / right on a touch screen to browse. Not while zoomed (the pane
  // scrolls) or while the page is pinch-zoomed (the swipe pans the page).
  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    swipeRef.current = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const start = swipeRef.current;
    const touch = event.changedTouches[0];
    swipeRef.current = null;
    if (!start || !touch || count < 2 || zoom || (window.visualViewport?.scale ?? 1) > 1.01) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return; // Too short, or mostly vertical.
    step(dx < 0 ? 1 : -1);
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
      className="kb-lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-start justify-center bg-transparent p-md open:flex md:p-xl"
    >
      {state && item && (
        <figure
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            swipeRef.current = null;
          }}
          className="my-auto flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl motion-safe:animate-view-in md:p-md"
        >
          <div className="flex items-start justify-between gap-md">
            <div className="flex min-w-0 flex-col gap-3xs">
              {count > 1 && (
                <p className="text-label-md text-text-secondary">
                  {state.index + 1} / {count}
                </p>
              )}
              <h2 id={titleId} className="text-title-md text-balance text-text-primary">
                {item.title}
              </h2>
            </div>
            {/* First focusable element, so showModal() puts focus here. */}
            <IconButton ref={closeRef} label="Close image viewer" icon={X} onClick={close} />
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
              "kb-lightbox-pane relative min-h-0 rounded-sm border border-border-subtle bg-bg-surface-default",
              zoom
                ? cn(
                    "kb-lightbox-viewport cursor-grab overflow-auto overscroll-contain select-none active:cursor-grabbing",
                    FOCUS_RING,
                  )
                : "flex items-center justify-center overflow-hidden",
            )}
          >
            {failed ? (
              <p className="flex items-center gap-xs p-xl text-body-md text-text-secondary">
                <ImageOff aria-hidden="true" size={16} />
                Image unavailable
              </p>
            ) : (
              <>
                {!loaded && (
                  <LoadingSkeleton key={item.src + "#skeleton"} item={item} className={IMAGE_ENTRY[state.direction]} />
                )}
                <img
                  key={item.src}
                  ref={setImage}
                  src={item.src}
                  alt={item.alt}
                  decoding="async"
                  draggable={false}
                  onLoad={handleImageLoad}
                  onError={() => setImageStatus("error")}
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
                    "block h-auto",
                    IMAGE_ENTRY[state.direction],
                    zoom
                      ? "kb-lightbox-image-zoomed mx-auto max-w-none"
                      : "kb-lightbox-image w-auto max-w-full object-contain",
                    // Kept in the accessibility tree (its alt) but out of the layout until it can be shown.
                    !loaded && "absolute opacity-0",
                  )}
                />
              </>
            )}
          </div>

          {/* Single image on a phone: no browse or zoom controls, so no toolbar. */}
          <div
            className={cn(
              "flex items-center gap-md",
              count > 1 ? "justify-between" : "hidden justify-center md:flex pointer-fine:flex",
            )}
          >
            {count > 1 && <IconButton label="Previous image" icon={ChevronLeft} onClick={() => step(-1)} />}
            <div className="flex items-center gap-md">
              <div role="group" aria-label="Zoom" className="hidden items-center gap-xs md:flex pointer-fine:flex">
                <IconButton
                  label="Zoom out"
                  title="Zoom out (-)"
                  aria-keyshortcuts="-"
                  icon={ZoomOut}
                  aria-disabled={zoomStep === 0 || !loaded}
                  onClick={() => zoomTo(zoomStep - 1)}
                />
                <p aria-live="polite" className="w-2xl text-center text-label-md text-text-secondary tabular-nums">
                  {zoom ? `${zoomLevel * 100}%` : "Fit"}
                </p>
                <IconButton
                  ref={zoomInRef}
                  label="Zoom in"
                  title="Zoom in (+)"
                  aria-keyshortcuts="+"
                  icon={ZoomIn}
                  aria-disabled={zoomStep === maxZoomStep || !loaded}
                  onClick={() => zoomTo(zoomStep + 1)}
                />
              </div>
              {count > 1 && (
                <>
                  <p className="hidden text-body-sm text-text-secondary sm:block pointer-coarse:hidden">
                    Use ← and → to browse
                  </p>
                  <p className="hidden text-body-sm text-text-secondary pointer-coarse:block">Swipe to browse</p>
                </>
              )}
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

/**
 * Placeholder while an image loads: the size the fitted image will have
 * (.kb-lightbox-skeleton in app.css), or the whole pane when the size is unknown.
 */
function LoadingSkeleton({ item, className }: { item: LightboxItem; className?: string }) {
  const { width, height } = item;
  const sized = width !== undefined && height !== undefined && width > 0 && height > 0;
  return (
    <div
      aria-hidden="true"
      style={
        sized ? ({ "--kb-aspect": width / height, "--kb-natural-width": width + "px" } as CSSProperties) : undefined
      }
      className={cn(
        "relative overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-raised",
        sized ? "kb-lightbox-skeleton" : "h-full w-full",
        className,
      )}
    >
      <ThumbnailScaffold />
    </div>
  );
}
