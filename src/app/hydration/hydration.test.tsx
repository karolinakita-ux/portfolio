import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { renderPage } from "#app/prerender.entry.tsx";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";
import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import { STATISTICS_CHOICE_KEY, STORED_CHOICE } from "#shared/lib/analytics/analytics.constants.ts";
import { initStatistics } from "#shared/lib/analytics/statistics-consent.utils.ts";
import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { mockMatchMedia } from "#test/match-media.ts";

// As in the other tests that render whole pages: the real preloader's idle timer would outlive this file and
// call `new Image()` after jsdom is gone, an unhandled error that fails the whole run (Netlify, v5.2.3).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/** The theme script in index.html, which runs before the app: it makes the page dark and presses a theme button. */
const THEME_SCRIPT = /<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/.exec(
  readFileSync(join(process.cwd(), "index.html"), "utf8"),
)?.[1];

const offline = { production: false, base: "/", hostname: "localhost", privacy: {} } as const;

interface FirstVisit {
  /** The visitor's stored pick; null: none (the page follows the system setting). */
  theme?: Theme | null;
}

/**
 * What a visitor's browser does with a prerendered page: the HTML scripts/prerender.ts writes (rendered with empty
 * storage, so light), the theme script from index.html, then the app adopts the HTML as src/main.tsx does.
 * Returns everything React reports while adopting it (in development it names each mismatch) and the <main> the
 * HTML brought.
 */
async function hydrate(view: View, { theme = null }: FirstVisit = {}) {
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  const container = document.createElement("div");
  container.innerHTML = renderPage();
  const main = container.querySelector("main");

  if (theme !== null) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  if (THEME_SCRIPT === undefined) throw new Error("index.html has no theme script");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs the page's own inline script, as the browser does
  (new Function(THEME_SCRIPT) as () => void)();
  document.body.append(container);
  // The theme script's MutationObserver presses the theme button in a microtask, as the parser adds it: in the
  // browser that happens long before the app's script runs.
  await new Promise((resolve) => setTimeout(resolve, 0));

  const reported: unknown[] = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => reported.push(args.map(String).join(" ")));
  render(
    <StrictMode>
      <App />
    </StrictMode>,
    { container, hydrate: true, onRecoverableError: (error) => reported.push(error) },
  );
  return { reported, main, container };
}

beforeEach(() => {
  initStatistics(offline);
});

afterEach(() => {
  initStatistics(offline);
});

/**
 * The browser adopts every prerendered page (hydrateRoot in src/main.tsx): the app's first render must match the
 * HTML, in Light and Dark, or React warns, and on a text mismatch throws the HTML away and renders the page again.
 */
describe("hydrating the prerendered pages", () => {
  it.each(VIEWS)("%s: adopts the HTML as it is", async (view) => {
    const { reported, main, container } = await hydrate(view);
    expect(reported).toEqual([]);
    expect(container.querySelector("main")).toBe(main);
  });

  it.each(VIEWS)("%s: adopts it on a dark page too (a stored Dark pick)", async (view) => {
    const { reported, main, container } = await hydrate(view, { theme: "dark" });
    expect(reported).toEqual([]);
    expect(container.querySelector("main")).toBe(main);
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
  });

  it("adopts it when the system asks for dark and nothing is stored", async () => {
    mockMatchMedia(true);
    const { reported } = await hydrate(VIEW.about);
    expect(reported).toEqual([]);
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the Dark thumbnails right after, in place of the prerendered Light files", async () => {
    const { reported, container } = await hydrate(VIEW.work, { theme: "dark" });
    expect(reported).toEqual([]);
    const thumbnails = Array.from(container.querySelectorAll<HTMLImageElement>("img[src*='thumbnail']"));
    expect(thumbnails.length).toBeGreaterThan(0);
    for (const img of thumbnails) expect(img).toHaveAttribute("src", expect.stringMatching(/thumbnail-dark\.webp$/));
  });

  it("adds the consent box and the visitor's statistics choice right after, not while adopting the HTML", async () => {
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, STORED_CHOICE.on);
    initStatistics({ ...offline, preview: true });
    const { reported } = await hydrate(VIEW.privacy);
    expect(reported).toEqual([]);
    expect(screen.getByRole("region", { name: PRIVACY.consent.title })).toBeInTheDocument();
    expect(screen.getByText(PRIVACY.statisticsSwitch.on)).toHaveAttribute("role", "status");
  });
});
