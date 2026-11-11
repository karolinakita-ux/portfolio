import type { CSSProperties } from "react";

import { styles } from "./Carousel.styles.ts";
import type { CarouselProps } from "./Carousel.types.ts";

/**
 * Figma: Carousel. A manual carousel’s track: a list that scrolls sideways and snaps to each item, 2 items in
 * view from tablet width up and 1 on phones, with the next one showing at the edge. It never moves on its own;
 * Previous and Next live in CarouselControls (both driven by useCarousel), and a swipe, a trackpad, a mouse drag
 * or Tab onto an item’s link moves it too. From tablet width up, an edge that cuts an item off fades. Every item
 * stays in the page for keyboards and screen readers.
 */
export function Carousel<T>({ items, getKey, renderItem, label, ref, onScroll, rows = 1 }: CarouselProps<T>) {
  // The items' shared rows (Carousel.styles.ts reads them); a custom property is not in React's style type.
  const shared = { "--kb-carousel-rows": rows } as CSSProperties;
  return (
    <ul ref={ref} aria-label={label} onScroll={onScroll} style={shared} className={styles.track}>
      {items.map((item) => (
        <li key={getKey(item)} className={styles.item}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
