import { useId, useRef, type KeyboardEvent } from "react";

import { LightboxHeader } from "#features/image-viewer/components/LightboxHeader/LightboxHeader.tsx";
import { LightboxToolbar } from "#features/image-viewer/components/LightboxToolbar/LightboxToolbar.tsx";
import { LoadingSkeleton } from "#features/image-viewer/components/LoadingSkeleton/LoadingSkeleton.tsx";
import { usePreloadNeighbours } from "#features/image-viewer/hooks/usePreloadNeighbours.ts";
import { useRevealedImage } from "#features/image-viewer/hooks/useRevealedImage.ts";
import { useSwipe } from "#features/image-viewer/hooks/useSwipe.ts";
import { useZoom } from "#features/image-viewer/hooks/useZoom.ts";
import { IMAGE_ENTRY } from "#features/image-viewer/lightbox.styles.ts";
import { zoomStyle } from "#features/image-viewer/lightbox.utils.ts";
import { Dialog } from "#shared/ui/Dialog/Dialog.tsx";
import { ImageOff } from "#shared/ui/icons/icons.tsx";

import { styles } from "./LightboxDialog.styles.ts";
import type { LightboxDialogProps } from "./LightboxDialog.types.ts";

/**
 * The viewer itself, in a modal Dialog (shared/ui/Dialog: the page behind becomes inert,
 * Escape and a backdrop click close it, focus stays inside, page scroll is locked).
 *
 * Controls: close button, Escape, click on the dimmed backdrop; with more than
 * one image, Previous / Next buttons, the ← / → keys and, on touch screens,
 * a swipe left / right (all wrapping around). Zoom: + / - / 0 and the toolbar (useZoom).
 *
 * Loading: the neighbouring images load ahead (usePreloadNeighbours). An image
 * that is not in the cache yet shows a skeleton of its own size and shape
 * (item.width / item.height) until it is decoded; zoom waits for it.
 */
export function LightboxDialog({ state, onClosed, onStep }: LightboxDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const zoomInRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const item = state ? state.items[state.index] : undefined;
  const count = state ? state.items.length : 0;

  const { status, imageRef, setImage, onLoad, onError } = useRevealedImage(item?.src ?? "");
  const loaded = status === "loaded";
  const failed = item !== undefined && status === "error";
  const { zoom, zoomStep, zoomLevel, zoomTo, resetZoom, paneHandlers } = useZoom({
    viewportRef,
    imageRef,
    closeRef,
    zoomInRef,
    loaded,
  });

  usePreloadNeighbours(state);

  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  const handleClose = () => {
    resetZoom();
    onClosed();
  };

  const step = (delta: number) => {
    resetZoom();
    onStep(delta);
  };

  const swipe = useSwipe(step, count > 1 && !zoom);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return; // Leave browser zoom alone.
    const zoomKeys: Record<string, number> = { "+": zoomStep + 1, "=": zoomStep + 1, "-": zoomStep - 1, "0": 0 };
    const browseKeys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    const zoomTarget = zoomKeys[event.key];
    const browse = browseKeys[event.key];
    if (zoomTarget !== undefined) {
      event.preventDefault();
      zoomTo(zoomTarget);
    } else if (browse !== undefined && count > 1 && event.target !== viewportRef.current) {
      // In the focused, zoomed pane the arrow keys scroll instead.
      event.preventDefault();
      step(browse);
    }
  };

  return (
    <Dialog
      dialogRef={dialogRef}
      open={state !== null}
      labelledBy={titleId}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
    >
      {state && item && (
        <figure {...swipe} className={styles.figure}>
          <LightboxHeader
            index={state.index}
            count={count}
            title={item.title}
            titleId={titleId}
            closeRef={closeRef}
            onClose={close}
          />

          <div
            ref={viewportRef}
            role={zoom ? "region" : undefined}
            aria-label={zoom ? "Zoomed image, scroll to pan" : undefined}
            tabIndex={zoom ? 0 : undefined}
            {...paneHandlers}
            className={styles.pane(zoom !== null)}
          >
            {failed ? (
              <p className={styles.unavailable}>
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
                  onLoad={onLoad}
                  onError={onError}
                  style={zoom ? zoomStyle(zoom, zoomLevel) : undefined}
                  className={styles.image(state.direction, zoom !== null, loaded)}
                />
              </>
            )}
          </div>

          <LightboxToolbar
            count={count}
            zoomStep={zoomStep}
            zoomLabel={zoom ? `${zoomLevel * 100}%` : "Fit"}
            loaded={loaded}
            zoomInRef={zoomInRef}
            onStep={step}
            onZoom={zoomTo}
          />

          <p className={styles.announcement} aria-live="polite">
            {count > 1 ? `Image ${state.index + 1} of ${count}: ${item.title}` : item.title}
          </p>
        </figure>
      )}
    </Dialog>
  );
}
