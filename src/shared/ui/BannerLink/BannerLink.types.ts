import type { ReactNode } from "react";

import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export interface BannerLinkProps {
  href: string;
  /** The brand icon before the label (Figma, GitHub, Blocks for Storybook). */
  icon: IconComponent;
  /** Counts the click: the caller's track() call, with the event and place of the banner the link sits in. */
  onClick?: () => void;
  children: ReactNode;
}
