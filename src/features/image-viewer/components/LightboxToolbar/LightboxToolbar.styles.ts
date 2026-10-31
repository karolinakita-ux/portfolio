import { clsx } from "clsx";

export const styles = {
  /**
   * One row on every screen. At 320px it holds Previous, the zoom controls and Next (each 32px, with a 40px touch
   * target: IconButton); the browse hints take the room left from the sm breakpoint up. A single image has no
   * Previous / Next, so its zoom controls sit in the middle.
   */
  root: (browsable: boolean) => clsx("flex items-center gap-md", browsable ? "justify-between" : "justify-center"),
  center: clsx("flex items-center gap-md"),
  zoom: clsx("flex items-center gap-xs"),
  zoomLevel: clsx("w-2xl text-center text-label-md text-text-secondary tabular-nums"),
  keysHint: clsx("hidden text-body-sm text-text-secondary sm:block pointer-coarse:hidden"),
  /** Beside the zoom controls it fits from the sm breakpoint up: a phone held upright shows Previous / Next only. */
  swipeHint: clsx("hidden text-body-sm text-text-secondary sm:pointer-coarse:block"),
};
