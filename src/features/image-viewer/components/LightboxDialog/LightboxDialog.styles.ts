import { clsx } from "clsx";

import { IMAGE_ENTRY } from "#features/image-viewer/lightbox.styles.ts";
import type { StepDirection } from "#features/image-viewer/lightbox.types.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  figure: clsx(
    "my-auto flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl motion-safe:animate-view-in md:p-md",
  ),
  pane: (zoomed: boolean) =>
    clsx(
      "kb-lightbox-pane relative min-h-0 rounded-sm border border-border-subtle bg-bg-surface-default",
      zoomed
        ? clsx(
            "kb-lightbox-viewport cursor-grab overflow-auto overscroll-contain select-none active:cursor-grabbing",
            FOCUS_RING,
          )
        : "flex items-center justify-center overflow-hidden",
    ),
  unavailable: clsx("flex items-center gap-xs p-xl text-body-md text-text-secondary"),
  image: (direction: StepDirection, zoomed: boolean, loaded: boolean) =>
    clsx(
      "block h-auto",
      IMAGE_ENTRY[direction],
      zoomed ? "kb-lightbox-image-zoomed mx-auto max-w-none" : "kb-lightbox-image w-auto max-w-full object-contain",
      // Kept in the accessibility tree (its alt) but out of the layout until it can be shown.
      !loaded && "absolute opacity-0",
    ),
  announcement: clsx("sr-only"),
};
