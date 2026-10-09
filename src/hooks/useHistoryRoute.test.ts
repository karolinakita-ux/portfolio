import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHistoryRoute } from "./useHistoryRoute.ts";

describe("useHistoryRoute", () => {
  it("starts on the view named in the URL", () => {
    window.history.replaceState(null, "", "/#about");
    const { result } = renderHook(() => useHistoryRoute());
    expect(result.current[0]).toMatchObject({ view: "about", key: 0, restoreY: null });
  });

  it("normalises aliases in the first history entry", () => {
    window.history.replaceState(null, "", "/#projects");
    const { result } = renderHook(() => useHistoryRoute());
    expect(result.current[0].view).toBe("work");
    expect(window.location.hash).toBe("");
  });

  it("pushes a history entry per view change", () => {
    const { result } = renderHook(() => useHistoryRoute());
    const before = window.history.length;

    act(() => result.current[1]("contact"));

    expect(result.current[0]).toMatchObject({ view: "contact", key: 1, anchor: null });
    expect(window.location.hash).toBe("#contact");
    expect(window.history.length).toBe(before + 1);
  });

  it("re-selecting the current view resets it without adding history", () => {
    const { result } = renderHook(() => useHistoryRoute());
    const before = window.history.length;

    act(() => result.current[1]("work", "enterprise-cases-title", { smooth: true }));

    expect(result.current[0]).toMatchObject({ view: "work", key: 1, anchor: "enterprise-cases-title", smooth: true });
    expect(window.history.length).toBe(before);
  });

  it("restores the view and scroll position on Back / Forward", () => {
    const { result } = renderHook(() => useHistoryRoute());
    act(() => result.current[1]("about"));

    act(() => {
      window.history.replaceState({ kbView: "case-theming", scrollY: 640 }, "", "/#case-theming");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { kbView: "case-theming", scrollY: 640 } }));
    });

    expect(result.current[0]).toMatchObject({ view: "case-theming", restoreY: 640, key: 2 });
  });
});
