import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

import type { ButtonVariant } from "./Button.types.ts";

/**
 * Figma: Button, Type = Primary | Secondary | Subtle | Link (states: default, hover, disabled).
 * On the gold fills (Secondary hover and pressed, every Subtle state) the label is text-on-accent: the dark
 * theme's light label would read 1.75-2.98:1 there, under the 4.5:1 of WCAG 1.4.3.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary: clsx(
    "bg-bg-interactive-primary-default font-semibold text-text-interactive-primary shadow-sm",
    "hover:bg-bg-interactive-primary-hover active:bg-bg-interactive-primary-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled disabled:shadow-none",
  ),
  secondary: clsx(
    "border border-border-interactive-default bg-bg-interactive-secondary-default text-text-interactive-secondary",
    "hover:border-border-interactive-hover hover:bg-bg-interactive-secondary-hover hover:text-text-on-accent",
    "active:bg-bg-interactive-secondary-active active:text-text-on-accent",
    "disabled:border-border-interactive-disabled disabled:text-text-interactive-disabled",
  ),
  subtle: clsx(
    "bg-bg-interactive-subtle-default text-text-on-accent",
    "hover:bg-bg-interactive-subtle-hover active:bg-bg-interactive-subtle-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled",
  ),
  // A transparent border: the click area is as big as a bordered (Secondary) button, not only the text.
  link: clsx(
    "border border-transparent text-text-primary decoration-1 underline-offset-4 hover:underline disabled:text-text-interactive-disabled",
  ),
};

// wrap-anywhere: the label may wrap inside its icons, so a long label fits a narrow screen at a large browser
// text size (min-content shrinks; at the default size the button keeps its one line).
export const button = cva(
  [
    "group/button inline-flex cursor-pointer items-center justify-center gap-xs rounded-md px-md py-xs text-label-lg wrap-anywhere",
    "transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard disabled:cursor-not-allowed",
    FOCUS_RING,
  ],
  { variants: { variant: VARIANT }, defaultVariants: { variant: "primary" } },
);

export const styles = {
  iconLeft: clsx("shrink-0"),
  iconRight: clsx(
    "shrink-0 transition-transform duration-fast ease-standard motion-safe:group-hover/button:translate-x-2xs",
  ),
};
