import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

/** " (opens in a new tab)" for screen readers, at the end of a link with EXTERNAL_LINK (WCAG 3.2.5). */
export function NewTabNote() {
  return <VisuallyHidden> (opens in a new tab)</VisuallyHidden>;
}
