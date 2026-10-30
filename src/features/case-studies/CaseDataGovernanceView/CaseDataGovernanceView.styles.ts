import { clsx } from "clsx";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  problemGrid: clsx("grid gap-lg md:grid-cols-2"),
  problemTitle: clsx("text-title-md text-text-primary"),
  problemBody: clsx("text-body-lg text-text-secondary"),
  problemList: BULLET_LIST,
  /** Feature rows: 48px apart below lg, 64px from lg, as in the shared case layout. */
  rows: clsx("flex list-none flex-col gap-2xl lg:gap-3xl"),
};
