/** The scroll reveal utility (app.css): on card lists only. */
export const REVEAL = "reveal-on-scroll";

/** Elements with the reveal on `element`, around it or inside it: none for content that stays still. */
export const revealsAround = (element: HTMLElement): Element[] =>
  [element.closest(`.${REVEAL}`), ...element.querySelectorAll(`.${REVEAL}`)].filter((found) => found !== null);
