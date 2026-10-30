import { clsx } from "clsx";

import type { ImageStatus } from "#shared/media/image-status/image-status.types.ts";

export const styles = {
  /**
   * No border or padding: the 16:10 images carry their own background and fill the frame edge to edge.
   * The surface colour shows only behind the loading wireframe. Radius matches the card around it.
   */
  root: clsx("relative aspect-case w-full max-w-full overflow-hidden rounded-md bg-bg-surface-subtle"),
  image: (status: ImageStatus, interactive: boolean) =>
    clsx(
      "absolute inset-0 h-full w-full object-cover transition-[opacity,scale] duration-slow ease-standard",
      status === "loaded" ? "opacity-100" : "opacity-0",
      { "motion-safe:group-hover/thumb:scale-[1.02]": interactive },
    ),
};
