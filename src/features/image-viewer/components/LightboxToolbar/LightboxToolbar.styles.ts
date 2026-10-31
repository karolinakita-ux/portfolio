import { clsx } from "clsx";

export const styles = {
  /**
   * One row where it fits: at 320px it holds Previous, the zoom controls and Next (each 32px, with a 40px touch
   * target: IconButton); the browse hints take the room left from the sm breakpoint up. Narrower than the row needs
   * (viewer-toolbar in theme.css: a phone with a larger text size or page zoom), the zoom controls take a centred row
   * of their own under Previous and Next (`center`), so nothing leaves the panel or scrolls sideways (WCAG 1.4.4).
   * The Tab order stays Previous, zoom, Next. A single image has no Previous / Next, so its zoom controls sit in the
   * middle.
   */
  root: (browsable: boolean) =>
    clsx("@container flex flex-wrap items-center gap-x-md gap-y-sm", browsable ? "justify-between" : "justify-center"),
  /** On its own row it keeps the row's width (min-w-0), so zoom controls a little wider than that stay centred. */
  center: clsx(
    "flex items-center gap-md @max-viewer-toolbar:order-last @max-viewer-toolbar:min-w-0 @max-viewer-toolbar:basis-full @max-viewer-toolbar:justify-center",
  ),
  zoom: clsx("flex items-center gap-xs"),
  zoomLevel: clsx("w-2xl text-center text-label-md text-text-secondary tabular-nums"),
  keysHint: clsx("hidden text-body-sm text-text-secondary sm:block pointer-coarse:hidden"),
  /** Beside the zoom controls it fits from the sm breakpoint up: a phone held upright shows Previous / Next only. */
  swipeHint: clsx("hidden text-body-sm text-text-secondary sm:pointer-coarse:block"),
};
