import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /**
   * size-2xl in the corner bottom-clear-consent places it: base.css keeps that corner out of the way of keyboard
   * focus (--kb-scroll-padding-bottom, with spacing-2xl), so a size change goes there too (BackToTop.test.tsx).
   */
  root: (visible: boolean) =>
    clsx(
      "fixed right-md bottom-clear-consent z-20 inline-flex size-2xl items-center justify-center rounded-full md:right-lg",
      "border border-border-subtle bg-bg-surface-raised text-text-primary shadow-lg",
      "transition-[opacity,transform,background-color] duration-medium ease-standard hover:bg-bg-surface-default",
      visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-xs opacity-0",
      FOCUS_RING,
    ),
};
