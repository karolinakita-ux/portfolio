import { clsx } from "clsx";

export const styles = {
  /**
   * A row that scrolls sideways and snaps to each item, with the edge of the next one showing, so it is clear
   * there is more: from tablet width up 2 whole items and a `space-2xl` (48px) slice of the third, enough for its
   * border and gold quote mark; below that 1 item at 83% of the width. At the end the last 2 items show whole
   * (Mateusz, 2026-11-11; on phones since 5.21.0). The padding, offset
   * by a negative margin, keeps the cards' shadows inside the scroll box, which would clip them. No scrollbar:
   * the controls, a swipe or a trackpad move it. The row fades up as one card list (reveal-on-scroll): inside
   * a sideways scroller the cards' own reveal would follow the row, not the page. Printed, every item shows.
   */
  track: clsx(
    "relative -m-2xs grid snap-x snap-mandatory scroll-p-2xs auto-cols-[83%] grid-flow-col gap-md overflow-x-auto overscroll-x-contain p-2xs",
    "md:auto-cols-[calc((100%-2*var(--spacing-md)-var(--spacing-2xl))/2)]",
    "scrollbar-none reveal-on-scroll",
    "print:grid-flow-row print:grid-cols-2 print:overflow-visible",
  ),
  item: clsx("flex min-w-0 snap-start"),
};
