import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { ExternalLink } from "#shared/ui/icons/icons.tsx";

import { styles } from "./LinkedInTextLink.styles.ts";
import type { LinkedInTextLinkProps } from "./LinkedInTextLink.types.ts";

/**
 * Text link to a LinkedIn page, opened in a new tab: link colour, underline and an
 * external-link icon. Its name starts with the visible label (WCAG 2.5.3), e.g.
 * "Stewart Wilson, LinkedIn profile (opens in a new tab)". An aria-label rather than
 * sr-only text: Chrome puts a space before a comma in an absolutely positioned span.
 */
export function LinkedInTextLink({ href, label, destination, target }: LinkedInTextLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, ${destination} (opens in a new tab)`}
      onClick={() => track(EVENT.linkedinClick, { target, place: "testimonials" })}
      className={styles.root}
    >
      {label}
      <ExternalLink aria-hidden="true" size={14} className={styles.icon} />
    </a>
  );
}
