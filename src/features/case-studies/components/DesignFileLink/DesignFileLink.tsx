import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { ArrowUpRight, Figma } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";

import { styles } from "./DesignFileLink.styles.ts";
import type { DesignFileLinkProps } from "./DesignFileLink.types.ts";

/**
 * "Open the Figma file" link (new tab) to a case study's design file: in the case intro under the details panel
 * and in the design files banner at the end. Counted as figma-click with its place.
 */
export function DesignFileLink({ file, caseView, place }: DesignFileLinkProps) {
  return (
    <a
      href={file.url}
      {...EXTERNAL_LINK}
      onClick={() => track(EVENT.figmaClick, { place, case: caseView })}
      className={styles.link}
    >
      <Figma aria-hidden="true" size={16} className={styles.icon} />
      {file.linkLabel}
      <ArrowUpRight aria-hidden="true" size={16} className={styles.arrow} />
      <NewTabNote />
    </a>
  );
}
