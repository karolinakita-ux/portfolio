import { styles } from "./Carousel.styles.ts";
import type { CarouselProps } from "./Carousel.types.ts";

/**
 * Figma: Carousel. A manual carousel’s track: a list that scrolls sideways and snaps to each item, 2 items in
 * view from tablet width up and 1 on phones, with the next one showing at the edge. It never moves on its own;
 * Previous and Next live in CarouselControls (both driven by useCarousel), and a swipe, a trackpad or Tab onto
 * an item’s link moves it too. Every item stays in the page for keyboards and screen readers.
 */
export function Carousel<T>({ items, getKey, renderItem, label, ref, onScroll }: CarouselProps<T>) {
  return (
    <ul ref={ref} aria-label={label} onScroll={onScroll} className={styles.track}>
      {items.map((item) => (
        <li key={getKey(item)} className={styles.item}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
