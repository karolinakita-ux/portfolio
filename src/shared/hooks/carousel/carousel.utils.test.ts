import { describe, expect, it } from "vitest";

import { measureTrack, scrollTarget } from "./carousel.utils.ts";

/** A track of `count` items `step` px apart (after 4px of padding), `width` px wide, scrolled to `left`. */
function track({ count = 5, step = 316, width = 616, left = 0 } = {}): HTMLElement {
  const element = document.createElement("ul");
  for (let index = 0; index < count; index++) {
    const item = document.createElement("li");
    Object.defineProperty(item, "offsetLeft", { value: 4 + index * step });
    element.append(item);
  }
  Object.defineProperty(element, "scrollWidth", { value: count * step - 16 + 8 });
  Object.defineProperty(element, "clientWidth", { value: width });
  element.scrollLeft = left;
  return element;
}

describe("measureTrack", () => {
  it("starts at the first item", () => {
    expect(measureTrack(track())).toEqual({ first: 0, atEnd: false });
  });

  it("takes the item whose start is nearest, so a swipe that stops between two counts as the closer one", () => {
    expect(measureTrack(track({ left: 2 * 316 }))).toEqual({ first: 2, atEnd: false });
    expect(measureTrack(track({ left: 316 + 100 }))).toEqual({ first: 1, atEnd: false });
    expect(measureTrack(track({ left: 316 + 200 }))).toEqual({ first: 2, atEnd: false });
  });

  it("knows the end from the scroll position, even when the last item cannot reach the start", () => {
    const end = track({ left: 5 * 316 - 16 + 8 - 616 });
    expect(measureTrack(end)).toEqual({ first: 3, atEnd: true });
  });
});

describe("scrollTarget", () => {
  it("brings an item to the start, measured from the first item (not the padding)", () => {
    expect(scrollTarget(track(), 2)).toBe(2 * 316);
  });

  it("stays within the track at both ends", () => {
    expect(scrollTarget(track(), -2)).toBe(0);
    expect(scrollTarget(track(), 9)).toBe(5 * 316 - 16 + 8 - 616);
  });
});
