import { clsx } from "clsx";

export const styles = {
  /** Single image on a phone: no browse or zoom controls, so no toolbar. */
  root: (browsable: boolean) =>
    clsx("flex items-center gap-md", browsable ? "justify-between" : "hidden justify-center md:flex pointer-fine:flex"),
  center: clsx("flex items-center gap-md"),
  zoom: clsx("hidden items-center gap-xs md:flex pointer-fine:flex"),
  zoomLevel: clsx("w-2xl text-center text-label-md text-text-secondary tabular-nums"),
  keysHint: clsx("hidden text-body-sm text-text-secondary sm:block pointer-coarse:hidden"),
  swipeHint: clsx("hidden text-body-sm text-text-secondary pointer-coarse:block"),
};
