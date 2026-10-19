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
  /** Allow and decline look the same: refusing is as easy as accepting. */
  actions: clsx("flex flex-wrap items-center gap-sm pt-2xs"),
  link: clsx("text-body-md", TEXT_LINK),
};
