import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";

import { App } from "./App/App.tsx";

// As in the other tests that render whole pages: the real preloader's idle timer would outlive this file and
// call `new Image()` after jsdom is gone, an unhandled error that fails the whole run (Netlify, v5.2.3).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/** Cmd + click on a Mac, Ctrl + click elsewhere: both open the link in a new tab. */
const NEW_TAB_CLICKS = [{ metaKey: true }, { ctrlKey: true }] as const;

/** Whether the app's own handler blocked the browser's default for this click. */
function blocksClick(link: HTMLAnchorElement, modifiers: (typeof NEW_TAB_CLICKS)[number]): boolean {
  let blocked = false;
  // Runs after React's handler, which sits on the root: records its answer, then stops jsdom from loading the
  // address, which a browser would open in a new tab.
  const record = (event: Event) => {
    blocked = event.defaultPrevented;
    event.preventDefault();
  };
  window.addEventListener("click", record, { once: true });
  fireEvent.click(link, modifiers);
  window.removeEventListener("click", record);
  return blocked;
}

/**
 * A link to one of the site's pages navigates in place only on a plain left click (isPlainLeftClick, as ViewLink
 * does). Cmd or Ctrl + click is left to the browser, which opens a new tab: reviewers open several case studies
 * side by side. Before 5.19.1 the case cards, the previous / next links, Explore Case Studies and the logo
 * blocked it and navigated in the same tab.
 */
describe("links to the site's pages leave Cmd and Ctrl + click to the browser", () => {
  it.each(VIEWS)("%s", (view) => {
    window.history.replaceState(null, "", VIEW_PATHS[view]);
    const { baseElement } = render(<App />);
    const links = [...baseElement.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')];
    expect(links.length).toBeGreaterThan(0);
    const blocked = NEW_TAB_CLICKS.flatMap((modifiers) =>
      links
        .filter((link) => blocksClick(link, modifiers))
        .map((link) => {
          const name = link.getAttribute("aria-label") ?? link.textContent;
          return `${Object.keys(modifiers).join("")}: ${name} -> ${link.getAttribute("href") ?? ""}`;
        }),
    );
    expect(blocked).toEqual([]);
    expect(window.location.pathname).toBe(VIEW_PATHS[view]);
  });
});
