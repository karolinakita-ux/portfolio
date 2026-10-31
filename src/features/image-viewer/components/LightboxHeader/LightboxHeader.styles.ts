import { clsx } from "clsx";

/**
 * Figma: Image Viewer · Go to Description. From md one row: the heading, then the controls (Go to Description, and
 * Close 8px to its right, centred against the 40px button). Below md the title row keeps the heading and Close, and
 * Go to Description wraps to a row of its own at the end, under Close: beside them it would leave a long title about
 * 125px at 390px. Close comes first in the DOM (it takes the focus on open), so from md the controls run right to
 * left; below md their group gives way (`contents`) and the two sit in the header's own rows.
 * The heading's margin and the row's 8px gap make the 16px between the heading and the controls.
 *
 * Narrower than viewer-toolbar (theme.css: a phone with a larger text size or page zoom, where the toolbar takes two
 * rows too), the heading gives way as well: the counter shares Close's row and the title takes the full width under
 * them. Beside Close it would wrap to twice as many lines, and the image pane would lose their height.
 */
export const styles = {
  root: clsx("@container flex flex-wrap items-start gap-x-xs gap-y-2xs md:flex-nowrap"),
  heading: clsx("mr-xs flex min-w-0 flex-1 flex-col gap-3xs @max-viewer-toolbar:contents"),
  counter: clsx(
    "text-label-md text-text-secondary @max-viewer-toolbar:mr-xs @max-viewer-toolbar:flex-1 @max-viewer-toolbar:self-center",
  ),
  title: clsx(
    "text-title-md text-balance text-text-primary @max-viewer-toolbar:order-1 @max-viewer-toolbar:basis-full",
  ),
  controls: clsx("contents md:flex md:flex-row-reverse md:items-center md:gap-xs"),
  /** Alone on its row (a single image has no counter), Close keeps to the right. */
  close: clsx("@max-viewer-toolbar:ml-auto"),
  description: clsx("flex basis-full justify-end md:basis-auto @max-viewer-toolbar:order-2"),
};
