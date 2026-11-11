import type { ReactNode, Ref, UIEventHandler } from "react";

export interface CarouselProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Accessible name of the list, e.g. “Recommendations”. */
  label: string;
  /**
   * Rows the items share (subgrid), so the parts of items side by side stay level whatever wraps: each item spans
   * them all, and a Card with `layout="rows"` places its parts in them. 1 by default: each item is one block.
   */
  rows?: number;
  /** From useCarousel. */
  ref?: Ref<HTMLUListElement>;
  /** From useCarousel. */
  onScroll?: UIEventHandler<HTMLUListElement>;
}
