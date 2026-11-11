import { clsx } from "clsx";

export const styles = {
  /**
   * A row that scrolls sideways and snaps to each item, with the edge of the next one showing, so it is clear
   * there is more: from tablet width up 2 whole items and a `space-2xl` (48px) slice of the third, enough for its
   * border and gold quote mark; below that 1 item at 83% of the width. At the end the last 2 items show whole
   * (Mateusz, 2026-11-11; on phones since 5.21.0). From tablet width up each edge fades while there is more that way
   * (`fade-scroll-edges`, Mateusz, 2026-11-11). The padding, offset
   * by a negative margin, keeps the cards' shadows inside the scroll box, which would clip them. No scrollbar:
   * the controls, a swipe, a trackpad or a mouse drag move it (`data-drag`, useCarouselDrag: a grab cursor, and
   * no snapping or text selection while the row follows the mouse). The row fades up as one card list
   * (reveal-on-scroll): inside a sideways scroller the cards' own reveal would follow the row, not the page.
   * Printed, every item shows. The items share `--kb-carousel-rows` rows (Carousel's `rows`, 1 by default): each
   * item is a subgrid across them all, so the parts of cards side by side stay level whatever wraps.
   */
  track: clsx(
    "relative -m-2xs grid snap-x snap-mandatory scroll-p-2xs auto-cols-[83%] grid-flow-col gap-md overflow-x-auto overscroll-x-contain p-2xs",
    "grid-rows-[repeat(var(--kb-carousel-rows),auto)]",
    "md:auto-cols-[calc((100%-2*var(--spacing-md)-var(--spacing-2xl))/2)]",
    "scrollbar-none reveal-on-scroll fade-scroll-edges",
    "data-[drag=idle]:cursor-grab data-[drag=settling]:cursor-grab",
    "data-[drag=active]:cursor-grabbing data-[drag=active]:snap-none data-[drag=active]:select-none",
    "data-[drag=settling]:snap-none",
    "print:grid-flow-row print:grid-cols-2 print:overflow-visible",
  ),
  item: clsx("row-span-[var(--kb-carousel-rows)] grid min-w-0 snap-start grid-rows-subgrid"),
};
