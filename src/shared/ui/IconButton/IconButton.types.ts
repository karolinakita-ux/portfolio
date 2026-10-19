import type { ButtonHTMLAttributes, Ref } from "react";

import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name and tooltip. */
  label: string;
  icon: IconComponent;
  ref?: Ref<HTMLButtonElement>;
}
