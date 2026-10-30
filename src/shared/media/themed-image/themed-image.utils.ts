import type { Theme } from "#shared/hooks/theme/theme.types.ts";

/** The image for the current theme: the dark version in Dark mode when there is one, else the default. */
export const pickThemedSrc = (theme: Theme, src: string, darkSrc?: string): string =>
  theme === "dark" && darkSrc ? darkSrc : src;

/**
 * Order in which an image tries its files: the themed one, then the default one (a broken dark version
 * falls back to the light one), then an optional last resort (a close-up falls back to the full screenshot).
 */
export function themedSources(theme: Theme, src: string, darkSrc?: string, fallbackSrc?: string): string[] {
  const sources = [pickThemedSrc(theme, src, darkSrc), src];
  if (fallbackSrc) sources.push(fallbackSrc);
  return sources.filter((value, index) => sources.indexOf(value) === index);
}
