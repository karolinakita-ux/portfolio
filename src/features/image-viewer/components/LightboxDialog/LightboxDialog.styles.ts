import { clsx } from "clsx";

import { IMAGE_ENTRY } from "#features/image-viewer/lightbox.styles.ts";
import type { StepDirection } from "#features/image-viewer/lightbox.types.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  figure: clsx(
    "my-auto flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl motion-safe:animate-view-in md:p-md",
  ),
  /**
   * Zoomed, the pane is a flex box and the image has auto margins (`image`): they centre it each way it is still
   * smaller than the pane (the height of a wide screenshot), as when fitted, and give way to scrolling to its edges
   * each way it is larger. `justify-center` / `items-center` would put part of a larger image out of scroll reach.
   */
  pane: (zoomed: boolean, dragging: boolean) =>
    clsx(
      "kb-lightbox-pane relative min-h-0 rounded-sm border border-border-subtle bg-bg-surface-default",
      zoomed
        ? clsx(
            "kb-lightbox-viewport flex overflow-auto overscroll-contain select-none",
            dragging ? "cursor-grabbing" : "cursor-grab",
            FOCUS_RING,
          )
        : "flex items-center justify-center overflow-hidden",
    ),
  unavailable: clsx("flex items-center gap-xs p-xl text-body-md text-text-secondary"),
  /**
   * The cursor says what a click does: zoom in where zoom is offered (md up or a mouse, as ZOOM_QUERY), back to fit
   * once zoomed, and grabbing while a drag pans.
   */
  image: (direction: StepDirection, zoomed: boolean, loaded: boolean, dragging: boolean) =>
    clsx(
      "block h-auto select-none",
      IMAGE_ENTRY[direction],
      zoomed ? "kb-lightbox-image-zoomed m-auto max-w-none shrink-0" : "kb-lightbox-image w-auto object-contain",
      {
        "md:cursor-zoom-in pointer-fine:cursor-zoom-in": loaded && !zoomed,
        "cursor-zoom-out": zoomed && !dragging,
        "cursor-grabbing": zoomed && dragging,
      },
      // Kept in the accessibility tree (its alt) but out of the layout until it can be shown.
      !loaded && "absolute opacity-0",
    ),
  announcement: clsx("sr-only"),
};
