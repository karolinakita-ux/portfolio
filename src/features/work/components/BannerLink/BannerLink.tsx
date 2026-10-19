import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { ArrowUpRight } from "#shared/ui/icons/icons.tsx";

import { styles } from "./BannerLink.styles.ts";
import type { BannerLinkProps } from "./BannerLink.types.ts";

/** External text link in the banner: brand icon, label, arrow (opens in a new tab). */
export function BannerLink({ href, icon: Icon, event, children }: BannerLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(event, { place: "banner" })}
      className={styles.root}
    >
      <Icon aria-hidden="true" size={16} className={styles.icon} />
      {children}
      <ArrowUpRight aria-hidden="true" size={16} className={styles.arrow} />
      <span className={styles.srOnly}> (opens in a new tab)</span>
    </a>
  );
}
