import { clsx } from "clsx";

import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: (className?: string) => clsx(TEXT_LINK, className),
};
