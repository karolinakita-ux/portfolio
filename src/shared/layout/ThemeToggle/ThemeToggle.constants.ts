import { Moon, Sun } from "#shared/ui/icons/icons.tsx";

import type { ThemeOption } from "./ThemeToggle.types.ts";

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "dark", label: "Dark mode", Icon: Moon },
];
