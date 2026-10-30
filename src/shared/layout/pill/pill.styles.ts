import { clsx } from "clsx";

/**
 * The yellow marker of the active item, behind its label (useSlidingPill moves it). Every item
 * has one; only the active one is visible. The transparent border shows in forced-colours
 * mode (Windows high contrast), where the background is dropped, so the active item stays marked.
 * transition-none: the hook does all of its motion (it fades a pill in or out when there is no
 * other to slide from); a CSS transition would only add stray ones, such as the near-zero
 * transitions the reduced-motion reset in motion.css gives every changed property. Its own text
 * colour (it has no text) keeps it from inheriting the label's colour transition, which WebKit
 * otherwise copies onto it even with transition-property: none.
 */
export const PILL = clsx(
  "pointer-events-none absolute inset-0 -z-10 border border-transparent bg-bg-accent-brand text-text-on-accent transition-none",
);

export const pillVisibility = (active: boolean): string => (active ? "opacity-100" : "opacity-0");
