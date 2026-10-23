import { describe, expect, it } from "vitest";

import { isPlainLeftClick } from "./ui.utils.ts";

describe("isPlainLeftClick", () => {
  const click = { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

  it("accepts a plain left click", () => {
    expect(isPlainLeftClick(click)).toBe(true);
  });

  it.each([
    ["middle click", { button: 1 }],
    ["Ctrl/Cmd click (new tab)", { ctrlKey: true }],
    ["Cmd click", { metaKey: true }],
    ["Shift click (new window)", { shiftKey: true }],
    ["Alt click", { altKey: true }],
    ["already handled", { defaultPrevented: true }],
  ])("leaves a %s to the browser", (_label, override) => {
    expect(isPlainLeftClick({ ...click, ...override })).toBe(false);
  });
});
