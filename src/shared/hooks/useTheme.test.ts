import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockMatchMedia } from "#test/matchMedia.ts";

import { THEME_STORAGE_KEY, useTheme } from "./useTheme.ts";

const html = () => document.documentElement;

describe("useTheme", () => {
  it("follows the system setting on a first visit", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark");
    expect(html()).toHaveStyle({ colorScheme: "dark" });
  });

  it("falls back to light without matchMedia", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe("light");
    expect(html()).not.toHaveClass("dark");
  });

  it("prefers a stored choice over the system setting", () => {
    mockMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe("light");
  });

  it("ignores invalid stored values", () => {
    mockMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe("dark");
  });

  it("stores the visitor's pick and applies it to <html>", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current[1]("dark"));
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("tracks live system changes until the visitor picks a theme", () => {
    const system = mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => system.change(true));
    expect(result.current[0]).toBe("dark");

    act(() => result.current[1]("light"));
    act(() => system.change(true));
    expect(result.current[0]).toBe("light");
  });
});
