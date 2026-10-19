import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

const TEXT_LINK = cn("text-text-link-default underline underline-offset-2 hover:text-text-link-hover");

export const styles = {
  root: cn("bg-bg-footer"),
  container: cn("pt-3xl pb-xl"),
  columns: cn("grid gap-2xl md:grid-cols-2 lg:mx-auto lg:max-w-footer"),
  heading: cn("text-title-md text-text-primary"),
  exploreList: cn("mt-md flex flex-col items-start gap-xs"),
  exploreLink: cn(
    "-mx-2xs block rounded-sm px-2xs py-3xs text-body-md text-text-primary underline-offset-4 hover:underline",
    FOCUS_RING,
  ),
  contactList: cn("mt-md flex flex-col gap-sm"),
  linkedinItem: cn("flex items-center gap-sm"),
  linkedinIcon: cn("shrink-0 text-text-secondary"),
  linkedinLink: cn("rounded-sm text-body-md", TEXT_LINK, FOCUS_RING),
  srOnly: cn("sr-only"),
  emailItem: cn("flex flex-wrap items-center gap-xs"),
  emailIcon: cn("shrink-0 text-text-secondary"),
  legal: cn("mt-4xl flex flex-col gap-2xs text-center text-body-sm text-text-secondary"),
  privacyLink: cn("rounded-sm", TEXT_LINK, FOCUS_RING),
};
