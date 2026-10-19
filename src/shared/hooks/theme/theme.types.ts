export type Theme = "light" | "dark";

export interface ThemeState {
  theme: Theme;
  /** True once the visitor has picked a theme (it is stored and wins over the system setting). */
  picked: boolean;
}
