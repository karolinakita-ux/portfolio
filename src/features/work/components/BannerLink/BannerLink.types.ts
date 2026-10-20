import type { ReactNode } from "react";

import type { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export interface BannerLinkProps {
  href: string;
  icon: IconComponent;
  /** Counted on click, with place: "banner". None for Storybook: the privacy policy does not list it. */
  event?: typeof EVENT.figmaClick | typeof EVENT.githubClick;
  children: ReactNode;
}
