/** The scroll reveal utility (utilities.css): on card lists only (docs/motion.md, Scroll reveal). */
export const REVEAL = "reveal-on-scroll";

/** Elements with the reveal on `element`, around it or inside it: none for content that stays still. */
export const revealsAround = (element: HTMLElement): Element[] =>
  [element.closest(`.${REVEAL}`), ...element.querySelectorAll(`.${REVEAL}`)].filter((found) => found !== null);

/** Every element with the reveal, in page order. */
export const revealing = (): Element[] => Array.from(document.querySelectorAll(`.${REVEAL}`));

/** Every card in page order: `data-card` marks a Card, a screenshot row, a comparison and a numbered card. */
export const cards = (): Element[] => Array.from(document.querySelectorAll("[data-card]"));

/**
 * The case pages' rule (Karolina, 2026-10-30): every card fades in, the impact stats included, except the cards in
 * the closing sections after the impact (reflections, takeaways, roadmap, handoff, lessons), which stay still.
 * The cards that should reveal, given those closing sections.
 */
export const cardsBefore = (closing: readonly Element[]): Element[] =>
  cards().filter((card) => !closing.some((section) => section.contains(card)));
