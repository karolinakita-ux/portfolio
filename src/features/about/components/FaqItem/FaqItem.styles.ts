import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("rounded-md border border-border-subtle bg-bg-surface-default"),
  heading: cn("text-title-md text-text-primary"),
  question: cn(
    "flex w-full items-center justify-between gap-md rounded-md px-lg py-md text-left",
    "transition-[color] duration-fast hover:text-text-secondary",
    FOCUS_RING,
  ),
  questionText: cn("min-w-0"),
  chevron: (open: boolean) =>
    cn("shrink-0 text-text-secondary transition-transform duration-medium ease-standard", open && "rotate-180"),
  /** Height animates via grid-template-rows 0fr → 1fr (no measured heights). */
  panel: (open: boolean) =>
    cn(
      "grid transition-[grid-template-rows] duration-medium ease-standard",
      open ? "grid-rows-expanded" : "grid-rows-collapsed",
    ),
  clip: cn("overflow-hidden"),
  answer: cn("flex flex-col gap-sm px-lg pb-lg"),
  answerText: cn("text-body-md text-text-secondary"),
};
