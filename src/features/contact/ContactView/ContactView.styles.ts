import { clsx } from "clsx";

import { BUTTON_HEIGHT, TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  hero: clsx("pt-xl"),
  heading: clsx("mt-xl flex flex-col gap-sm"),
  intro: clsx("text-body-lg text-text-secondary"),
  emailRow: clsx("flex items-center gap-xs"),
  emailText: clsx("text-body-lg"),
  linkedinLink: clsx("inline-flex items-center gap-xs", TEXT_LINK),
  linkIcon: clsx("shrink-0"),
  /**
   * The CV's two links: a row that may wrap, spaced like buttons (BUTTON_HEIGHT, gap-y-sm; Karolina's rule).
   * -my-xs: the links' button height overlaps the cell's spacing, so the text sits as close to its label as the
   * LinkedIn link does (as in CvHeader).
   */
  cvLinks: clsx("-my-xs flex flex-wrap gap-x-lg gap-y-sm"),
  cvLink: clsx("inline-flex items-center gap-xs", BUTTON_HEIGHT, TEXT_LINK),
  roles: clsx("flex list-disc flex-col gap-xs pl-lg marker:text-text-primary"),
};
