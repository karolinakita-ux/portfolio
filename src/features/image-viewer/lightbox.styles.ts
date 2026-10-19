import { clsx } from "clsx";

import type { StepDirection } from "./lightbox.types.ts";

/** Entry animation of the image (and its skeleton) by the direction of the last move. */
export const IMAGE_ENTRY: Record<StepDirection, string> = {
  1: clsx("motion-safe:animate-slide-in-next"),
  [-1]: clsx("motion-safe:animate-slide-in-prev"),
  0: clsx("motion-safe:animate-view-in"),
};
