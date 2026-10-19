import { clsx } from "clsx";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  problemGrid: clsx("grid gap-md md:grid-cols-2"),
  problemTitle: clsx("text-title-md text-text-primary"),
  problemBody: clsx("text-body-md text-text-secondary"),
  problemList: BULLET_LIST,
  rows: clsx("flex flex-col gap-md"),
};
