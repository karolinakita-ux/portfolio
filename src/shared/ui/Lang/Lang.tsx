import type { LangProps } from "./Lang.types.ts";

/**
 * Inline phrase in another language (e.g. quoted Polish UI labels), so screen readers switch pronunciation
 * (WCAG 3.1.2 Language of Parts). Keep quote marks outside the span.
 */
export function Lang({ lang, children }: LangProps) {
  return <span lang={lang}>{children}</span>;
}
