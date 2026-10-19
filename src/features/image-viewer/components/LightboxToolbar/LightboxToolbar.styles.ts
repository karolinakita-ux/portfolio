import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** Single image on a phone: no browse or zoom controls, so no toolbar. */
  root: (browsable: boolean) =>
    cn("flex items-center gap-md", browsable ? "justify-between" : "hidden justify-center md:flex pointer-fine:flex"),
  center: cn("flex items-center gap-md"),
  zoom: cn("hidden items-center gap-xs md:flex pointer-fine:flex"),
  zoomLevel: cn("w-2xl text-center text-label-md text-text-secondary tabular-nums"),
  keysHint: cn("hidden text-body-sm text-text-secondary sm:block pointer-coarse:hidden"),
  swipeHint: cn("hidden text-body-sm text-text-secondary pointer-coarse:block"),
};
