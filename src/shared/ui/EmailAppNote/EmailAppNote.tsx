import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

/**
 * " (opens your email app)" for screen readers, at the end of every mailto: link on the site's pages (CopyEmail,
 * EmailLink), as NewTabNote does for a link that opens a new tab. The visible address stays first in the link's
 * name (WCAG 2.5.3).
 */
export function EmailAppNote() {
  return <VisuallyHidden> (opens your email app)</VisuallyHidden>;
}
