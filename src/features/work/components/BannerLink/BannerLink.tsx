import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { ArrowUpRight } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";

import { styles } from "./BannerLink.styles.ts";
import type { BannerLinkProps } from "./BannerLink.types.ts";

/** External text link in the banner: brand icon, label, arrow (opens in a new tab). */
export function BannerLink({ href, icon: Icon, event, children }: BannerLinkProps) {
  return (
    <a href={href} {...EXTERNAL_LINK} onClick={() => track(event, { place: "banner" })} className={styles.root}>
      <Icon aria-hidden="true" size={16} className={styles.icon} />
      {children}
      <ArrowUpRight aria-hidden="true" size={16} className={styles.arrow} />
      <NewTabNote />
    </a>
  );
}
