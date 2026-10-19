import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

import type { ButtonVariant } from "./Button.types.ts";

/** Figma: Button, Type = Primary | Secondary | Subtle | Link (states: default, hover, disabled). */
const VARIANT: Record<ButtonVariant, string> = {
  primary: clsx(
    "bg-bg-interactive-primary-default font-semibold text-text-interactive-primary shadow-sm",
    "hover:bg-bg-interactive-primary-hover active:bg-bg-interactive-primary-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled disabled:shadow-none",
  ),
  secondary: clsx(
    "border border-border-interactive-default bg-bg-interactive-secondary-default text-text-interactive-secondary",
    "hover:border-border-interactive-hover hover:bg-bg-interactive-secondary-hover active:bg-bg-interactive-secondary-active",
    "disabled:border-border-interactive-disabled disabled:text-text-interactive-disabled",
  ),
  subtle: clsx(
    "bg-bg-interactive-subtle-default text-text-interactive-secondary",
    "hover:bg-bg-interactive-subtle-hover active:bg-bg-interactive-subtle-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled",
  ),
  link: clsx(
    "text-text-primary decoration-1 underline-offset-4 hover:underline disabled:text-text-interactive-disabled",
  ),
};

export const button = cva(
  [
    "group/button inline-flex cursor-pointer items-center justify-center gap-xs rounded-md px-md py-xs text-label-lg",
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
