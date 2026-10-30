import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { mockMatchMedia } from "#test/matchMedia.ts";
import { UA } from "#test/user-agents.ts";

import { THEME_STORAGE_KEY, THEME_SWITCHING_CLASS } from "./theme.constants.ts";
import { useTheme } from "./useTheme.ts";

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

/**
 * A stand-in for document.startViewTransition (jsdom has none). Like a browser, it runs the
 * update callback (here at once) and returns a ViewTransition whose `ready` can reject.
 */
function mockStartViewTransition({ skipped = false } = {}) {
  const start = vi.fn((update: () => void) => {
    update();
    return {
      ready: skipped ? Promise.reject(new DOMException("Transition was skipped", "AbortError")) : Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
    } as unknown as ViewTransition;
  });
  Object.defineProperty(document, "startViewTransition", { configurable: true, writable: true, value: start });
  onTestFinished(() => {
    Reflect.deleteProperty(document, "startViewTransition");
  });
  return start;
}

/** Collects requestAnimationFrame callbacks; `next()` runs the frame that is due. */
function mockFrames() {
  let queue = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    queue.set(++id, callback);
    return id;
  });
  const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((handle) => {
    queue.delete(handle);
  });
  return {
    cancel,
    next() {
      const due = queue;
      queue = new Map();
      for (const callback of due.values()) callback(0);
    },
  };
}

describe("useTheme cross-fade", () => {
  it("runs each change in a view transition when the browser has them and motion is on", () => {
    mockMatchMedia(false);
    const start = mockStartViewTransition();
    const { result } = renderHook(() => useTheme());
    expect(start).not.toHaveBeenCalled();

    act(() => result.current[1]("dark"));
    expect(start).toHaveBeenCalledOnce();
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark");

    act(() => result.current[1]("dark")); // already shown: only stored, no transition
    expect(start).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    act(() => result.current[1]("light"));
    expect(start).toHaveBeenCalledTimes(2);
    expect(html()).not.toHaveClass("dark");
  });

  it("cross-fades a live system change through the same path", () => {
    const system = mockMatchMedia(false, { "(prefers-reduced-motion: reduce)": false });
    const start = mockStartViewTransition();
    const { result } = renderHook(() => useTheme());

    act(() => system.change(true));
    expect(start).toHaveBeenCalledOnce();
    expect(result.current[0]).toBe("dark");
  });

  it("applies the theme without a transition when reduced motion is on", () => {
    mockMatchMedia(true); // reduced motion, and a dark system theme
    const start = mockStartViewTransition();
    const { result } = renderHook(() => useTheme());

    act(() => result.current[1]("light"));
    expect(start).not.toHaveBeenCalled();
    expect(result.current[0]).toBe("light");
    expect(html()).not.toHaveClass("dark");
  });

  it.each([
    ["Messenger on Android", UA.messengerAndroid],
    ["Facebook on Android", UA.facebookAndroid],
  ])("applies the theme in one frame, without a transition, in %s", (_, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    mockMatchMedia(false);
    const start = mockStartViewTransition();
    const frames = mockFrames();
    const { result } = renderHook(() => useTheme());

    act(() => result.current[1]("dark"));
    expect(start).not.toHaveBeenCalled();
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark", THEME_SWITCHING_CLASS);
    act(() => frames.next());
    act(() => frames.next());
    expect(html()).not.toHaveClass(THEME_SWITCHING_CLASS);
  });

  it("keeps the cross-fade in Chrome on Android", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(UA.chromeAndroid);
    mockMatchMedia(false);
    const start = mockStartViewTransition();
    const { result } = renderHook(() => useTheme());

    act(() => result.current[1]("dark"));
    expect(start).toHaveBeenCalledOnce();
    expect(html()).toHaveClass("dark");
  });

  it("applies the theme directly where the browser has no view transitions", () => {
    mockMatchMedia(false);
    expect(document).not.toHaveProperty("startViewTransition"); // jsdom
    const { result } = renderHook(() => useTheme());

    act(() => result.current[1]("dark"));
    expect(result.current[0]).toBe("dark");
    expect(html()).toHaveClass("dark");
  });

  it("keeps a pick when a system change's deferred update lands after it", () => {
    const system = mockMatchMedia(false, { "(prefers-reduced-motion: reduce)": false });
    // Browsers run the update callback a frame later: hold it until the test runs it.
    const updates: Array<() => void> = [];
    const start = vi.fn((update: () => void) => {
      updates.push(update);
      return { ready: Promise.resolve() } as unknown as ViewTransition;
    });
    Object.defineProperty(document, "startViewTransition", { configurable: true, writable: true, value: start });
    onTestFinished(() => {
      Reflect.deleteProperty(document, "startViewTransition");
    });
    const { result } = renderHook(() => useTheme());

    act(() => system.change(true)); // the system turns dark (update held by the transition)...
    act(() => result.current[1]("light")); // ...the visitor picks light, still on screen: applies at once
    expect(start).toHaveBeenCalledOnce();
    act(() => {
      for (const update of updates) update(); // the system's update finally runs
    });
    expect(result.current[0]).toBe("light");
    expect(html()).not.toHaveClass("dark");
  });

  it("treats a skipped transition as normal (the theme still applies, no unhandled rejection)", async () => {
    mockMatchMedia(false);
    mockStartViewTransition({ skipped: true });
    const { result } = renderHook(() => useTheme());

    act(() => result.current[1]("dark"));
    await Promise.resolve();
    expect(html()).toHaveClass("dark");
  });
});

describe("useTheme same-frame colour change", () => {
  it("pauses CSS transitions on <html> for two frames after a change, not on the first render", () => {
    mockMatchMedia(false);
    const frames = mockFrames();
    const { result } = renderHook(() => useTheme());
    expect(html()).not.toHaveClass(THEME_SWITCHING_CLASS);

    act(() => result.current[1]("dark"));
    expect(html()).toHaveClass("dark", THEME_SWITCHING_CLASS);
    act(() => frames.next());
    expect(html()).toHaveClass(THEME_SWITCHING_CLASS);
    act(() => frames.next());
    expect(html()).not.toHaveClass(THEME_SWITCHING_CLASS);
    expect(html()).toHaveClass("dark");
  });

  it("pauses them for a live system change too", () => {
    const system = mockMatchMedia(false);
    mockFrames();
    renderHook(() => useTheme());

    act(() => system.change(true));
    expect(html()).toHaveClass("dark", THEME_SWITCHING_CLASS);
  });

  it("restarts the two frames on a quick second change and cleans up on unmount", () => {
    mockMatchMedia(false);
    const frames = mockFrames();
    const { result, unmount } = renderHook(() => useTheme());

    act(() => result.current[1]("dark"));
    act(() => frames.next());
    act(() => result.current[1]("light")); // one frame in: the first change's frames are cancelled
    expect(frames.cancel).toHaveBeenCalledOnce();
    act(() => frames.next());
    expect(html()).toHaveClass(THEME_SWITCHING_CLASS);
    act(() => frames.next());
    expect(html()).not.toHaveClass(THEME_SWITCHING_CLASS);

    act(() => result.current[1]("dark"));
    unmount();
    expect(html()).not.toHaveClass(THEME_SWITCHING_CLASS);
  });
});
