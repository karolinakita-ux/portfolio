import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export interface ThemeOption {
  value: Theme;
  label: string;
  Icon: IconComponent;
}
