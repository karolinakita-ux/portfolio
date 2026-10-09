import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Light / dark theme.
 * - First visit: follows the system setting (prefers-color-scheme), and keeps
 *   following it live (e.g. automatic dark mode at sunset).
 * - Once the visitor picks a theme with the toggle, that choice is stored and
 *   wins on every later visit.
 * The inline script in index.html applies the same logic before the first
 * paint, so the page never flashes the wrong theme. Keep THEME_STORAGE_KEY in sync.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "kb-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

const readStoredTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null; // storage blocked (private mode, strict settings)
  }
};

const systemTheme = (): Theme => {
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [state, setState] = useState(() => {
    const stored = readStoredTheme();
    return { theme: stored ?? systemTheme(), picked: stored !== null };
  });

  // Theme lives on <html> so <body>, overscroll areas and scrollbars follow it.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
  }, [state.theme]);

  // Follow live system changes until the visitor makes a choice.
  useEffect(() => {
    if (state.picked || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setState((current) => (current.picked ? current : { ...current, theme: event.matches ? "dark" : "light" }));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [state.picked]);

  const pickTheme = useCallback((value: Theme) => {
    setState({ theme: value, picked: true });
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      /* storage blocked: the choice still applies for this visit */
    }
  }, []);

  return [state.theme, pickTheme];
}
