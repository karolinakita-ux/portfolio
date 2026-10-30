import { clsx } from "clsx";

export const styles = {
  /**
   * No border or padding: the 16:10 images carry their own background and fill the frame edge to edge.
   * The surface colour shows only behind the loading wireframe. Radius matches the card around it.
   */
  root: clsx("relative aspect-case w-full max-w-full overflow-hidden rounded-md bg-bg-surface-subtle"),
  /**
   * The image overlaps the frame by 1px on every side (the frame clips it): while the hover zoom runs, the browser
   * draws the image on its own layer snapped to whole pixels, and on a frame of fractional height (16:10 of most
   * widths) a 1px strip of the frame's background showed at the bottom until the zoom ended.
   * `lightFile`: the Light file of a Light/Dark pair, hidden on a dark page (light-page-only, utilities.css).
   */
  image: (shown: boolean, interactive: boolean, lightFile: boolean) =>
    clsx(
      "absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] max-w-none object-cover",
      "transition-[opacity,scale] duration-slow ease-standard",
      shown ? "opacity-100" : "opacity-0",
      { "motion-safe:group-hover/thumb:scale-[1.02]": interactive, "light-page-only": lightFile },
    ),
};
