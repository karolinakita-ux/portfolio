import type { LangProps } from "./Lang.types.ts";

/**
 * Text in another language (e.g. quoted Polish UI labels), so screen readers switch pronunciation
 * (WCAG 3.1.2 Language of Parts). Keep quote marks outside the span. `as="p"` marks a whole paragraph: Chromium's
 * tagged PDFs carry the language of a paragraph, not of a span inside it.
 */
export function Lang({ lang, as: Element = "span", children }: LangProps) {
  return <Element lang={lang}>{children}</Element>;
}
