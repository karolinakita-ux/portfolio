import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";

import { styles } from "./TextLink.styles.ts";
import type { TextLinkProps } from "./TextLink.types.ts";

/** An inline text link: link colour, underline, focus ring. `external` opens it in a new tab. */
export function TextLink({ external = false, className, children, ...props }: TextLinkProps) {
  return (
    <a className={styles.root(className)} {...(external ? EXTERNAL_LINK : {})} {...props}>
      {children}
      {external && <NewTabNote />}
    </a>
  );
}
