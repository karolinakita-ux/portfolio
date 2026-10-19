import { clsx } from "clsx";

import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /**
   * A small card above the bottom edge (z-consent: over the back-to-top button, under the header and
   * dialogs). It never blocks the page and never moves: it appears as it is (no motion at load).
   */
  root: clsx(
    "fixed inset-x-md bottom-md z-consent mx-auto flex max-w-reading flex-col gap-sm rounded-lg border border-border-subtle bg-bg-surface-raised p-lg shadow-xl md:bottom-lg print:hidden",
  ),
  title: clsx("text-title-md text-text-primary"),
  text: clsx("text-body-md text-text-secondary"),
  /** The choice first, the link to the details apart from it: at the end of the row from sm, below on phones. */
  actions: clsx("flex flex-col items-start gap-sm pt-2xs sm:flex-row sm:items-center sm:justify-between"),
  /**
   * Allow and decline look the same, both primary: refusing is as easy as accepting, and neither is
   * pushed (EDPB cookie banner taskforce report, para. 13 and 17; the GOV.UK cookie banner does the same).
   */
  choices: clsx("flex flex-wrap gap-sm"),
  link: clsx("text-body-md", TEXT_LINK),
};
