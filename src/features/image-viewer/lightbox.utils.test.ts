import { describe, expect, it } from "vitest";

import { DRAG_PX } from "#shared/lib/analytics/analytics.constants.ts";

import { anchorAt, scrollToAnchor, travelledFar } from "./lightbox.utils.ts";

/** An element with a fixed box on the screen (jsdom has no layout) and a 1px border, like the image pane. */
const boxed = (rect: { left: number; top: number; width: number; height: number }, border = 0) => {
  const element = document.createElement("div");
  element.getBoundingClientRect = () => DOMRect.fromRect({ x: rect.left, y: rect.top, ...rect });
  Object.defineProperty(element, "clientLeft", { value: border });
  Object.defineProperty(element, "clientTop", { value: border });
  return element;
};

describe("travelledFar", () => {
  it("draws the statistics' line between a click and a drag", () => {
    expect(travelledFar({ x: 100, y: 100 }, 100 + DRAG_PX, 100)).toBe(false);
    expect(travelledFar({ x: 100, y: 100 }, 100 + DRAG_PX * 0.6, 100 + DRAG_PX * 0.8)).toBe(false); // diagonally
    expect(travelledFar({ x: 100, y: 100 }, 100, 100 + DRAG_PX + 1)).toBe(true);
  });
});

describe("anchorAt", () => {
  it("gives the clicked point as fractions of the image and the pointer's place inside the pane's border", () => {
    const pane = boxed({ left: 50, top: 100, width: 1000, height: 600 }, 1);
    const image = boxed({ left: 150, top: 200, width: 800, height: 400 });
    expect(anchorAt(350, 500, image, pane)).toEqual({ x: 0.25, y: 0.75, left: 299, top: 399 });
  });

  it("keeps the point on the image, and takes the middle of an image with no size", () => {
    const pane = boxed({ left: 0, top: 0, width: 1000, height: 600 });
    expect(anchorAt(-20, 900, boxed({ left: 0, top: 0, width: 800, height: 400 }), pane)).toMatchObject({ x: 0, y: 1 });
    expect(anchorAt(10, 10, boxed({ left: 0, top: 0, width: 0, height: 0 }), pane)).toMatchObject({ x: 0.5, y: 0.5 });
  });
});

describe("scrollToAnchor", () => {
  it("scrolls the zoomed pane so the clicked point of the image is under the pointer again", () => {
    // The pane scrolled 100px right and 40px down already; the image starts 20px into the scrolled content.
    const pane = boxed({ left: 50, top: 100, width: 1000, height: 600 }, 1);
    pane.scrollLeft = 100;
    pane.scrollTop = 40;
    const image = boxed({ left: 50 + 1 + 20 - 100, top: 100 + 1 - 40, width: 1600, height: 800 });

    scrollToAnchor(pane, image, { x: 0.25, y: 0.75, left: 299, top: 399 });
    // Point in the content: 20 + 0.25 * 1600 = 420 across, 0.75 * 800 = 600 down; minus the pointer's place.
    expect(pane.scrollLeft).toBe(420 - 299);
    expect(pane.scrollTop).toBe(600 - 399);
  });

  it("measures the image's place: centred in a pane it is shorter than, it needs no scroll down", () => {
    // A wide screenshot fitted at 800 x 200 in the middle of a 1000 x 600 pane, clicked on its middle line
    // (200 + 0.5 * 200 = 300px down the pane); zoomed to 1600 x 400, its auto margins centre it 100px down.
    const pane = boxed({ left: 50, top: 100, width: 1000, height: 600 }, 1);
    const image = boxed({ left: 50 + 1, top: 100 + 1 + 100, width: 1600, height: 400 });

    scrollToAnchor(pane, image, { x: 0.25, y: 0.5, left: 299, top: 300 });
    expect(pane.scrollLeft).toBe(0.25 * 1600 - 299);
    // 100 + 0.5 * 400 = 300 down the content: under the pointer already. Pinned to the top, the point would sit
    // 200px down, and no scroll could move it to 300.
    expect(pane.scrollTop).toBe(0);
  });
});
