import { clsx } from "clsx";

import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  hero: clsx("pt-xl"),
  heading: clsx("mt-xl flex flex-col gap-sm"),
  intro: clsx("text-body-lg text-text-secondary"),
  emailRow: clsx("flex items-center gap-xs"),
  emailText: clsx("text-body-lg"),
  linkedinLink: clsx("inline-flex items-center gap-xs", TEXT_LINK),
  linkedinIcon: clsx("shrink-0"),
  roles: clsx("flex list-disc flex-col gap-xs pl-lg marker:text-text-primary"),
};
