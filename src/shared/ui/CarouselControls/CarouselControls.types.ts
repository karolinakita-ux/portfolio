export interface CarouselControlsLabels {
  /** Name and tooltip of the Previous button, e.g. “Previous recommendations”. */
  previous: string;
  /** Name and tooltip of the Next button, e.g. “Next recommendations”. */
  next: string;
}

/** The position and moves from useCarousel. */
export interface CarouselControlsProps {
  /** 1-based number of the first item in view. */
  first: number;
  /** 1-based number of the last item in view (the same as `first` when one item shows). */
  last: number;
  count: number;
  atStart: boolean;
  atEnd: boolean;
  /** True after Previous or Next moved the carousel: only then does the screen reader status speak. */
  announce: boolean;
  onPrevious: () => void;
  onNext: () => void;
  labels: CarouselControlsLabels;
}
