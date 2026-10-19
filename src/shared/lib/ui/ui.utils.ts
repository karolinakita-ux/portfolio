import type { ClickModifiers } from "./ui.types.ts";

/** Joins class names, skipping falsy values. */
export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

/** True when the visitor asked the system for reduced motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** tel: link for a display phone number (keeps digits and "+"). */
export const telHref = (phone: string): string => "tel:" + phone.replace(/[^\d+]/g, "");

/** True for a plain left click (no modifier): the app navigates in place; otherwise the browser opens a tab. */
export const isPlainLeftClick = (event: ClickModifiers): boolean =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
