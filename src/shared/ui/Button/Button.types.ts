import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "link";

export interface ButtonOwnProps {
  variant?: ButtonVariant;
  iconLeft?: IconComponent;
  iconRight?: IconComponent;
  className?: string;
  children: ReactNode;
}

export type AsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { as?: "button" };
export type AsAnchor = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & { as: "a" };

export type ButtonProps = AsButton | AsAnchor;
