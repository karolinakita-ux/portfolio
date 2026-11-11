import { describe, expect, it } from "vitest";

import { measureTrack, paintEdgeFades, scrollRoom, scrollTarget } from "./carousel.utils.ts";

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

/** The default track's end: 5 items 316px apart with 16px gaps and 4px padding each side, in a 616px view. */
const END = 5 * 316 - 16 + 8 - 616;

describe("scrollRoom", () => {
  it("at the start, only the end has more: only the end fades", () => {
    expect(scrollRoom(track())).toEqual({ start: 0, end: END });
  });

  it("in the middle, both ends have more: both fade, also where an edge falls on a whole item", () => {
    expect(scrollRoom(track({ left: 2 * 316 }))).toEqual({ start: 2 * 316, end: END - 2 * 316 });
  });

  it("at the end, only the start has more: only the start fades", () => {
    expect(scrollRoom(track({ left: END }))).toEqual({ start: END, end: 0 });
  });

  it("hands both to the CSS fade in px, which caps them at 24px", () => {
    const element = track({ left: 10 });
    paintEdgeFades(element);
    expect(element.style.getPropertyValue("--kb-fade-start")).toBe("10px");
    expect(element.style.getPropertyValue("--kb-fade-end")).toBe(`${String(END - 10)}px`);
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
