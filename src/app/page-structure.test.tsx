import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CV_SHEET_ID } from "#features/cv/cv.constants.ts";
import { VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { outlineProblems } from "#test/heading-outline.ts";

import { App } from "./App/App.tsx";

// As in the other tests that render whole pages: the real preloader's idle timer would outlive this file and
// call `new Image()` after jsdom is gone, an unhandled error that fails the whole run (Netlify, v5.2.3).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const renderPage = (view: (typeof VIEWS)[number]) => {
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  return render(<App />);
};

/** What screen reader users rely on to find their way, on every page as the app renders it. */
describe("page structure", () => {
  it.each(VIEWS)("%s: the headings form an outline that matches the page (src/test/heading-outline.ts)", (view) => {
    const { baseElement } = renderPage(view);
    expect(baseElement.querySelectorAll("h2").length).toBeGreaterThan(0);
    expect(outlineProblems(baseElement)).toEqual([]);
  });

  /**
   * Like the Contact page's and the footer's address (CopyEmail), so the inline ones (EmailLink) too. Not the CV
   * sheet: it is the PDF's source, plain text for applicant tracking systems.
   */
  it.each(VIEWS)("%s: every mail link says it opens the email app", (view) => {
    const { baseElement } = renderPage(view);
    const links = [...baseElement.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')].filter(
      (link) => !link.closest("#" + CV_SHEET_ID),
    );
    expect(links.length).toBeGreaterThan(0); // the footer's at least
    for (const link of links) expect(link).toHaveTextContent(/\S \(opens your email app\)$/);
  });
});
