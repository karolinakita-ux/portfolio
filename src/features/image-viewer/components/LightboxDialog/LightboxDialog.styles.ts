import { IMAGE_ENTRY } from "#features/image-viewer/lightbox.styles.ts";
import type { StepDirection } from "#features/image-viewer/lightbox.types.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  dialog: cn(
    "kb-lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-start justify-center bg-transparent p-md open:flex md:p-xl",
  ),
  figure: cn(
    "my-auto flex w-full max-w-header min-w-0 flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-sm shadow-xl motion-safe:animate-view-in md:p-md",
  ),
  pane: (zoomed: boolean) =>
    cn(
      "kb-lightbox-pane relative min-h-0 rounded-sm border border-border-subtle bg-bg-surface-default",
      zoomed
        ? cn(
            "kb-lightbox-viewport cursor-grab overflow-auto overscroll-contain select-none active:cursor-grabbing",
            FOCUS_RING,
          )
        : "flex items-center justify-center overflow-hidden",
    ),
  unavailable: cn("flex items-center gap-xs p-xl text-body-md text-text-secondary"),
  image: (direction: StepDirection, zoomed: boolean, loaded: boolean) =>
    cn(
      "block h-auto",
      IMAGE_ENTRY[direction],
      zoomed ? "kb-lightbox-image-zoomed mx-auto max-w-none" : "kb-lightbox-image w-auto max-w-full object-contain",
      // Kept in the accessibility tree (its alt) but out of the layout until it can be shown.
      !loaded && "absolute opacity-0",
    ),
  announcement: cn("sr-only"),
};
