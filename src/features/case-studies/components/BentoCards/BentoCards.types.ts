import type { BentoCard, BentoVisual } from "#features/case-studies/bento.types.ts";

export interface BentoCardsProps {
  items: readonly BentoCard[];
  /** Number of the first card (cards continue across sections: 01 - 04, then 05 - 06). */
  start?: number;
  /** 3: wide cards span two columns from lg; 2: two equal columns from md. */
  columns?: 2 | 3;
}

export interface BentoVisualProps {
  visual: BentoVisual;
}
