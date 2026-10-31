import { describe, expect, it, vi } from "vitest";

import { DRAG_PX } from "#shared/lib/analytics/analytics.constants.ts";

import {
  anchorAt,
  descriptionOffset,
  freeBand,
  landingOffset,
  scrollToAnchor,
  showsIn,
  travelledFar,
} from "./lightbox.utils.ts";

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

describe("landingOffset", () => {
  /** Below an 80px header, above an 800px window's bottom edge. */
  const band = { top: 80, bottom: 800 };
  const box = (top: number, height: number) => DOMRect.fromRect({ x: 0, y: top, width: 600, height });

  it("leaves a row that shows in full where it is", () => {
    expect(landingOffset(box(80, 720), box(200, 300), band)).toBe(0);
    expect(landingOffset(box(300, 400), box(350, 300), band)).toBe(0);
  });

  it("brings a row below or above the window to the top, just under the header", () => {
    expect(landingOffset(box(1500, 500), box(1600, 300), band)).toBe(1500 - 80);
    expect(landingOffset(box(-900, 500), box(-800, 300), band)).toBe(-900 - 80);
    expect(landingOffset(box(60, 500), box(100, 300), band)).toBe(-20); // half under the header
  });

  it("starts a row taller than the window at its top, where the description is, while the screenshot shows too", () => {
    // Text 600px, then the screenshot: at the top of the band it starts 600px down, still inside the window.
    expect(landingOffset(box(2000, 1400), box(2600, 800), band)).toBe(2000 - 80);
  });

  it("shows the whole screenshot instead when the row's top would leave it below the window", () => {
    // A feature section's second screenshot on a phone: 900px down its section, 300px tall.
    expect(landingOffset(box(2000, 1300), box(2900, 300), band)).toBe(2900 + 300 - 800);
    // A screenshot taller than the band: its top under the header.
    expect(landingOffset(box(2000, 2400), box(2900, 1000), band)).toBe(2900 - 80);
  });

  it("keeps clear of the consent box: the band ends at its top, not at the window's bottom", () => {
    // The box covers the bottom 300px of the 800px window (scroll-padding-bottom): the band is 80..500.
    const withBox = { top: 80, bottom: 500 };
    // A row that shows in full in the window but runs under the box moves up, its top below the header.
    expect(landingOffset(box(300, 400), box(350, 300), band)).toBe(0);
    expect(landingOffset(box(300, 400), box(350, 300), withBox)).toBe(300 - 80);
    // From the row's top the screenshot would start under the box (580 down): its bottom at the box's top instead.
    expect(landingOffset(box(2000, 800), box(2500, 300), band)).toBe(2000 - 80);
    expect(landingOffset(box(2000, 800), box(2500, 300), withBox)).toBe(2500 + 300 - 500);
  });
});

describe("descriptionOffset", () => {
  const band = { top: 80, bottom: 800 };
  const box = (top: number, height: number) => DOMRect.fromRect({ x: 0, y: top, width: 600, height });

  it("leaves the page still while the description and the screenshot's area show in full", () => {
    expect(descriptionOffset(100, box(100, 600), band)).toBe(0);
    // The operations console: the section's heading at 150, the screen's figure below it, all in the band.
    expect(descriptionOffset(150, box(500, 280), band)).toBe(0);
  });

  it("starts the description just below the header, even where the screenshot then sits below the window", () => {
    // A feature section on a phone, 1300px tall, scrolled to its second screenshot: the text starts above the header.
    // landingOffset would keep the screenshot in view (and the section's heading under the header).
    expect(descriptionOffset(-150, box(-150, 1300), band)).toBe(-150 - 80);
    expect(landingOffset(box(-150, 1300), box(650, 300), band)).toBe(650 + 300 - 800);
    // The operations console's 8th screen, far below its section's heading.
    expect(descriptionOffset(-1800, box(300, 280), band)).toBe(-1800 - 80);
    // A row whose top is in view but whose screenshot runs below the window: its top under the header.
    expect(descriptionOffset(400, box(400, 600), band)).toBe(400 - 80);
  });

  it("keeps clear of the consent box", () => {
    expect(descriptionOffset(300, box(300, 400), { top: 80, bottom: 500 })).toBe(300 - 80);
  });
});

describe("freeBand", () => {
  it("is the window between the page's scroll padding at the top (header) and at the bottom (consent box)", () => {
    const getStyle = window.getComputedStyle.bind(window);
    const style = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((element, pseudo) =>
        element === document.documentElement
          ? ({ scrollPaddingTop: "123px", scrollPaddingBottom: "514px" } as unknown as CSSStyleDeclaration)
          : getStyle(element, pseudo),
      );
    expect(freeBand()).toEqual({ top: 123, bottom: window.innerHeight - 514 });
    style.mockImplementation((element, pseudo) =>
      element === document.documentElement
        ? ({ scrollPaddingTop: "", scrollPaddingBottom: "auto" } as unknown as CSSStyleDeclaration)
        : getStyle(element, pseudo),
    );
    expect(freeBand()).toEqual({ top: 0, bottom: window.innerHeight });
    style.mockRestore();
  });
});

describe("showsIn", () => {
  const band = { top: 80, bottom: 800 };
  const box = (top: number, height: number) => DOMRect.fromRect({ x: 0, y: top, width: 600, height });

  it("takes a box that shows in part, not one hidden under the header or below the window", () => {
    expect(showsIn(box(700, 300), band)).toBe(true);
    expect(showsIn(box(-100, 200), band)).toBe(true);
    expect(showsIn(box(0, 80), band)).toBe(false);
    expect(showsIn(box(800, 100), band)).toBe(false);
  });
});
