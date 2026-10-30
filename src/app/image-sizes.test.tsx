import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it, vi } from "vitest";

import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { renderPage } from "./prerender.entry.tsx";

// As in the other tests that render whole pages: the real preloader's idle timer would outlive this file and
// call `new Image()` after jsdom is gone, an unhandled error that fails the whole run (Netlify, v5.2.3).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/** Every <img> of a view's prerendered HTML (what scripts/prerender.ts writes): its src and size attributes. */
function prerenderedImages(view: View) {
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  const page = new DOMParser().parseFromString(renderPage(), "text/html");
  return Array.from(page.querySelectorAll("img"), (img) => ({
    src: img.getAttribute("src") ?? "",
    size: [Number(img.getAttribute("width")), Number(img.getAttribute("height"))],
  }));
}

/** Pages that show images: the Work thumbnails, the portrait and every case's screenshots. */
const WITH_IMAGES: readonly View[] = [
  VIEW.work,
  VIEW.about,
  VIEW.caseDataGovernance,
  VIEW.caseProjectPlanning,
  VIEW.caseAutomotive,
  VIEW.caseSmartTicket,
];

/**
 * Every image in the first HTML carries its file's width and height, so the browser lays out each image's
 * height before the file arrives: the text below a screenshot does not jump down when it loads, and a link
 * to a section further down lands on it.
 */
describe("image sizes in the prerendered pages", () => {
  it.each(VIEWS)("%s: every image has the width and height of its file", (view) => {
    for (const { src, size } of prerenderedImages(view)) {
      expect(size, src).toEqual(ASSET_SIZES[src.replace(/^\/assets\//, "")]);
    }
  });

  it.each(WITH_IMAGES)("%s: has images to check", (view) => {
    expect(prerenderedImages(view).length).toBeGreaterThan(0);
  });
});
