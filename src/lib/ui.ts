/** Joins class names, skipping falsy values. */
export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

/** True when the visitor asked the system for reduced motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Denim focus ring (borderInteractiveFocus), keyboard only. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-interactive-focus";

/** Case-study bullet list: Body Medium, disc markers in textSecondary. */
export const BULLET_LIST =
  "flex list-disc flex-col gap-xs pl-lg text-body-md text-text-secondary marker:text-text-secondary";

/**
 * Inline links in printable documents (CV, cover letter): denim on screen,
 * plain dark text on paper (the URL is the visible label).
 */
export const DOC_LINK = cn(
  "rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
  "print:text-text-primary print:no-underline",
  FOCUS_RING,
);

/** tel: link for a display phone number (keeps digits and "+"). */
export const telHref = (phone: string): string => "tel:" + phone.replace(/[^\d+]/g, "");

/** True for a plain left click (no modifier): the app navigates in place; otherwise the browser opens a tab. */
export const isPlainLeftClick = (event: {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean =>
  !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
