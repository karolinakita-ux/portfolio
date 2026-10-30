import type { Theme } from "./helpers.types.ts";

/** The app's own localStorage key for the visitor's theme pick (the inline script in index.html reads it too). */
export { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";

export const THEMES: readonly Theme[] = ["light", "dark"];

export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;

/** bgCanvas in src/styles/tokens.css. */
export const CANVAS: Readonly<Record<Theme, string>> = { light: "#ffffff", dark: "#1a1a1a" };

export const THEME_LABEL: Readonly<Record<Theme, string>> = { light: "Light theme", dark: "Dark theme" };

export const SELECTOR = {
  primaryNav: 'nav[aria-label="Primary"]',
  navPills: 'nav[aria-label="Primary"] [data-pill]',
  themeGroup: '[role="group"][aria-label="Color theme"]',
  themePills: '[role="group"][aria-label="Color theme"] [data-pill]',
} as const;
