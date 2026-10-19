import { clsx } from "clsx";

import { FOCUS_RING, TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: clsx("bg-bg-footer"),
  container: clsx("pt-3xl pb-xl"),
  columns: clsx("grid gap-2xl md:grid-cols-2 lg:mx-auto lg:max-w-footer"),
  heading: clsx("text-title-md text-text-primary"),
  exploreList: clsx("mt-md flex flex-col items-start gap-xs"),
  exploreLink: clsx(
    "-mx-2xs block rounded-sm px-2xs py-3xs text-body-md text-text-primary underline-offset-4 hover:underline",
    FOCUS_RING,
  ),
  contactList: clsx("mt-md flex flex-col gap-sm"),
  linkedinItem: clsx("flex items-center gap-sm"),
  icon: clsx("shrink-0 text-text-secondary"),
  linkedinLink: clsx("text-body-md", TEXT_LINK),
  emailItem: clsx("flex flex-wrap items-center gap-xs"),
  legal: clsx("mt-4xl flex flex-col gap-2xs text-center text-body-sm text-text-secondary"),
  privacyLink: TEXT_LINK,
};
