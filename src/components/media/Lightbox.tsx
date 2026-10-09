import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "../icons.tsx";
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
 */
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isOpen = state !== null;
  const item = state ? state.items[state.index] : undefined;
  const count = state ? state.items.length : 0;
  const failed = item !== undefined && failedSrc === item.src;

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

  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  const handleClose = () => {
    document.documentElement.classList.remove("kb-scroll-locked");
    onClosed();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onStep(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onStep(-1);
    }
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

          <div className="flex min-h-0 items-center justify-center overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default">
            {failed ? (
              <p className="flex items-center gap-xs p-xl text-body-md text-text-secondary">
                <ImageOff aria-hidden="true" size={16} />
                Image unavailable
              </p>
            ) : (
              <img
                key={item.src}
                src={item.src}
                alt={item.alt}
                decoding="async"
                onError={() => setFailedSrc(item.src)}
                className="kb-lightbox-image block h-auto w-auto max-w-full object-contain motion-safe:animate-view-in"
              />
            )}
          </div>

          {count > 1 && (
            <div className="flex items-center justify-between gap-md">
              <IconButton label="Previous image" icon={ChevronLeft} onClick={() => onStep(-1)} />
              <p className="hidden text-body-sm text-text-secondary sm:block">Use ← and → to browse</p>
              <IconButton label="Next image" icon={ChevronRight} onClick={() => onStep(1)} />
            </div>
          )}

          <p className="sr-only" aria-live="polite">
            {count > 1 ? `Image ${state.index + 1} of ${count}: ${item.title}` : item.title}
          </p>
        </figure>
      )}
    </dialog>
  );
}
