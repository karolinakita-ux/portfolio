import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";

import { styles } from "./TextLink.styles.ts";
import type { TextLinkProps } from "./TextLink.types.ts";

/**
 * An inline text link: link colour, underline, focus ring. `external` opens it in a new tab, and a
 * click on it is counted with the website it opens (outbound-click).
 */
export function TextLink({ href, external = false, className, children, onClick, ...props }: TextLinkProps) {
  return (
    <a
      href={href}
      className={styles.root(className)}
      {...(external ? EXTERNAL_LINK : {})}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (external) track(EVENT.outboundClick, { host: new URL(href, window.location.href).hostname });
      }}
    >
      {children}
      {external && <NewTabNote />}
    </a>
  );
}
