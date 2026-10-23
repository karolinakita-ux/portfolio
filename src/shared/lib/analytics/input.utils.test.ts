import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as Input from "./input.utils.ts";

/** The module keeps the last input: each test gets a fresh copy. */
let input: typeof Input;
let stop: () => void;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  input = await import("./input.utils.ts");
  stop = input.watchInput();
});

afterEach(() => {
  stop();
  vi.useRealTimers();
});

describe("pointerInput", () => {
  it("tells touch and pen apart from the mouse", () => {
    expect(input.pointerInput("touch")).toBe("touch");
    expect(input.pointerInput("pen")).toBe("pen");
    expect(input.pointerInput("mouse")).toBe("mouse");
    expect(input.pointerInput("")).toBe("mouse");
  });
});

describe("recentInput", () => {
  it("names the input pressed just before, and nothing a second later", () => {
    expect(input.recentInput()).toBeUndefined();
    fireEvent.pointerDown(document.body, { pointerType: "touch" });
    expect(input.recentInput()).toBe("touch");
    vi.advanceTimersByTime(1001);
    expect(input.recentInput()).toBeUndefined();

    fireEvent.pointerDown(document.body, { pointerType: "pen" });
    expect(input.recentInput()).toBe("pen");
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(input.recentInput()).toBe("keyboard");
  });

  it("keeps the mouse when a modifier key is held for the click", () => {
    fireEvent.pointerDown(document.body, { pointerType: "mouse" });
    fireEvent.keyDown(document.body, { key: "Control" });
    fireEvent.keyDown(document.body, { key: "Shift" });
    expect(input.recentInput()).toBe("mouse");
  });

  it("forgets the input and stops listening when stopped", () => {
    fireEvent.keyDown(document.body, { key: "Enter" });
    stop();
    expect(input.recentInput()).toBeUndefined();
    fireEvent.pointerDown(document.body, { pointerType: "touch" });
    expect(input.recentInput()).toBeUndefined();
  });
});
