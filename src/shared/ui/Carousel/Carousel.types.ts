import type { ReactNode, Ref, UIEventHandler } from "react";

export interface CarouselProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Accessible name of the list, e.g. “Recommendations”. */
  label: string;
  /** From useCarousel. */
  ref?: Ref<HTMLUListElement>;
  /** From useCarousel. */
  onScroll?: UIEventHandler<HTMLUListElement>;
}
