import { carouselRange } from "#shared/hooks/carousel/carousel.utils.ts";
import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { ChevronLeft, ChevronRight } from "#shared/ui/icons/icons.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./CarouselControls.styles.ts";
import type { CarouselControlsProps } from "./CarouselControls.types.ts";

/**
 * Figma: CarouselControls. Where a carousel is (“1 - 2 of 5”) and Previous / Next, which move it by one view.
 * At either end the button stays focusable and says it is unavailable (aria-disabled), so focus never drops to
 * the page. The position changes as soon as Previous or Next is pressed, before the row has moved there. A
 * screen reader hears the position as “1 to 2 of 5”, and the new one right after Previous or Next
 * (“Showing 3 to 4 of 5”), never on load or after a swipe.
 */
export function CarouselControls({
  first,
  last,
  count,
  atStart,
  atEnd,
  announce,
  onPrevious,
  onNext,
  labels,
}: CarouselControlsProps) {
  const range = carouselRange(first, last);
  const spoken = first === last ? String(first) : `${String(first)} to ${String(last)}`;
  const status = announce ? `Showing ${spoken} of ${String(count)}` : "";
  const single = first === last;
  return (
    <div className={styles.root}>
      <p className={styles.position}>
        {single ? (
          `${range} of ${String(count)}`
        ) : (
          // A screen reader may skip the hyphen ("1 2 of 5"): it hears "1 to 2 of 5" instead.
          <>
            <span aria-hidden="true">
              {range} of {count}
            </span>{" "}
            <VisuallyHidden>
              {spoken} of {count}
            </VisuallyHidden>
          </>
        )}
      </p>{" "}
      <IconButton
        label={labels.previous}
        icon={ChevronLeft}
        aria-disabled={atStart}
        onClick={() => {
          if (!atStart) onPrevious();
        }}
      />{" "}
      <IconButton
        label={labels.next}
        icon={ChevronRight}
        aria-disabled={atEnd}
        onClick={() => {
          if (!atEnd) onNext();
        }}
      />
      <VisuallyHidden>
        <span aria-live="polite">{status}</span>
      </VisuallyHidden>
    </div>
  );
}
