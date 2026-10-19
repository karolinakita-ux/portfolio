import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";

import { DARK_QUERY, THEME_STORAGE_KEY, THEME_SWITCHING_CLASS } from "./theme.constants.ts";
import type { Theme, ThemeState } from "./theme.types.ts";
import { changeTheme, readStoredTheme, systemTheme } from "./theme.utils.ts";

/**
 * Light / dark theme.
 * - First visit: follows the system setting (prefers-color-scheme), and keeps
 *   following it live (e.g. automatic dark mode at sunset).
 * - Once the visitor picks a theme with the toggle, that choice is stored and
 *   wins on every later visit.
 * The inline script in index.html applies the same logic before the first
 * paint, so the page never flashes the wrong theme. Keep THEME_STORAGE_KEY (theme.constants.ts) in sync.
 *
 * A change cross-fades the page where the browser has view transitions (app.css times it
 * with the motion tokens), and every colour on the page switches in the same frame.
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [state, setState] = useState<ThemeState>(() => {
    const stored = readStoredTheme();
    return { theme: stored ?? systemTheme(), picked: stored !== null };
  });
  /** The theme last applied to <html>; null before the first layout effect. */
  const appliedTheme = useRef<Theme | null>(null);

  // Theme lives on <html> so <body>, overscroll areas and scrollbars follow it.
  // On a change (not the first render), CSS transitions pause for two frames so the header,
  // buttons and text switch together with the page instead of trailing behind it.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.style.colorScheme = state.theme;
    const changed = appliedTheme.current !== null && appliedTheme.current !== state.theme;
    appliedTheme.current = state.theme;
    if (!changed) return undefined;

    root.classList.add(THEME_SWITCHING_CLASS);
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => root.classList.remove(THEME_SWITCHING_CLASS));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      root.classList.remove(THEME_SWITCHING_CLASS);
    };
  }, [state.theme]);

  // Follow live system changes until the visitor makes a choice.
  useEffect(() => {
    if (state.picked || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      const theme: Theme = event.matches ? "dark" : "light";
      changeTheme(() => setState((current) => (current.picked ? current : { ...current, theme })));
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [state.picked]);

  const pickTheme = useCallback(
    (value: Theme) => {
      const update = () => setState({ theme: value, picked: true });
      // Picking the theme already shown only stores it: nothing to cross-fade, nothing to count.
      if (value === state.theme) update();
      else {
        track(EVENT.themeSwitch, { theme: value });
        changeTheme(update);
      }
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, value);
      } catch {
        /* storage blocked: the choice still applies for this visit */
      }
    },
    [state.theme],
  );

  return [state.theme, pickTheme];
}
