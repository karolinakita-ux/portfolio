import type { ClickModifiers } from "./ui.types.ts";

/** True when the visitor asked the system for reduced motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True for a plain left click (no modifier): the app navigates in place; otherwise the browser opens a tab. */
export const isPlainLeftClick = (event: ClickModifiers): boolean =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
