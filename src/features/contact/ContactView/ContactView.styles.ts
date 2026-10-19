import { BULLET_LIST, FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  hero: cn("pt-xl"),
  heading: cn("mt-xl flex flex-col gap-sm"),
  title: cn("font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"),
  intro: cn("text-body-lg text-text-secondary"),
  emailRow: cn("flex items-center gap-xs"),
  emailText: cn("text-body-lg"),
  linkedinLink: cn(
    "inline-flex items-center gap-xs rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
    FOCUS_RING,
  ),
  linkedinIcon: cn("shrink-0"),
  srOnly: cn("sr-only"),
  roles: cn("flex list-disc flex-col gap-xs pl-lg marker:text-text-primary"),
  privacyList: BULLET_LIST,
};
