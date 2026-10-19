import { clsx } from "clsx";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /** Reading width: about 75 characters per line. */
  prose: clsx("flex max-w-reading flex-col gap-md text-body-md text-text-secondary"),
  points: BULLET_LIST,
  /** The section's own component (switch, table, note), at the same width as the text. */
  extra: clsx("max-w-reading"),
};
