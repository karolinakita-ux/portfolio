import { clsx } from "clsx";

export const styles = {
  /**
   * A row that scrolls sideways and snaps to each item: 2 items in view from tablet width up (the gap shared
   * between them), below that 1 item at 83% of the width, so the next one shows at the edge. The padding, offset
   * by a negative margin, keeps the cards' shadows inside the scroll box, which would clip them. No scrollbar:
   * the controls, a swipe or a trackpad move it. The row fades up as one card list (reveal-on-scroll): inside
   * a sideways scroller the cards' own reveal would follow the row, not the page. Printed, every item shows.
   */
  track: clsx(
    "relative -m-2xs grid snap-x snap-mandatory scroll-p-2xs auto-cols-[83%] grid-flow-col gap-md overflow-x-auto overscroll-x-contain p-2xs",
    "md:auto-cols-[calc((100%-var(--spacing-md))/2)]",
    "scrollbar-none reveal-on-scroll",
    "print:grid-flow-row print:grid-cols-2 print:overflow-visible",
  ),
  item: clsx("flex min-w-0 snap-start"),
};
