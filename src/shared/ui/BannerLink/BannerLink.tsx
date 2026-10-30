import { EXTERNAL_LINK } from "#shared/lib/ui/ui.constants.ts";
import { ArrowUpRight } from "#shared/ui/icons/icons.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";

import { styles } from "./BannerLink.styles.ts";
import type { BannerLinkProps } from "./BannerLink.types.ts";

/**
 * External text link in a banner: brand icon, label, arrow; opens in a new tab. The Work page's Behind the Design
 * banner and a case study's Figma file links use it; each counts its own click (onClick).
 */
export function BannerLink({ href, icon: Icon, onClick, children }: BannerLinkProps) {
  return (
    <a href={href} {...EXTERNAL_LINK} onClick={onClick} className={styles.root}>
      <Icon aria-hidden="true" size={16} className={styles.icon} />
      {children}
      <ArrowUpRight aria-hidden="true" size={16} className={styles.arrow} />
      <NewTabNote />
    </a>
  );
}
