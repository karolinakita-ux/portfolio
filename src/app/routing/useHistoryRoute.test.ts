import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { setHashRouting } from "#shared/lib/routes/routes.utils.ts";

import { useHistoryRoute } from "./useHistoryRoute.ts";

const start = (url: string) => {
  window.history.replaceState(null, "", url);
  return renderHook(() => useHistoryRoute()).result;
};

/** jsdom does not scroll: set the position the hook reads. */
const scrollTo = (y: number) => {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true, writable: true });
};

/** Back or Forward to an entry whose state was read earlier. */
const travelTo = (state: unknown, url: string) => {
  window.history.replaceState(state, "", url);
  window.dispatchEvent(new PopStateEvent("popstate", { state }));
};

describe("useHistoryRoute", () => {
  it("starts on the view named in the path", () => {
    const result = start("/about");
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: null, key: 0, viewKey: 0, restoreY: null });
    expect(window.location.pathname).toBe("/about");
  });

  it("keeps a section anchor from the first URL", () => {
    const result = start("/about#career");
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: "career" });
    expect(window.location.hash).toBe("#career");
  });

  it("drops a tracking tag an app wrote after the hash, and keeps the section and the query", () => {
    const result = start("/about?ref=section-link#career?fbclid=IwAR0abc");
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: "career" });
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      "/about?ref=section-link#career",
    );
  });

  it("turns old hash links and aliases into paths", () => {
    start("/#case-theming");
    expect(window.location.pathname).toBe("/work/data-governance");
    expect(window.location.hash).toBe("");

    start("/resume"); // the CV's old name
    expect(window.location.pathname).toBe("/cv");

    const result = start("/#projects");
    expect(result.current[0].view).toBe(VIEW.work);
    expect(window.location.hash).toBe("");
  });

  it("turns the file forms the host also serves (/about.html, /about/index.html) into the page's path", () => {
    const result = start("/about.html?ref=linkedin#career");
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: "career" });
    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/about?ref=linkedin#career");

    start("/work/automotive/index.html");
    expect(window.location.pathname).toBe("/work/automotive");
  });

  it("sends unknown paths to Work at /", () => {
    const result = start("/blog?ref=cv");
    expect(result.current[0].view).toBe(VIEW.work);
    expect(window.location.pathname + window.location.search).toBe("/?ref=cv");
  });

  it("pushes a history entry per view change", () => {
    const result = start("/");
    const before = window.history.length;

    act(() => result.current[1](VIEW.contact));

    expect(result.current[0]).toMatchObject({ view: VIEW.contact, key: 1, viewKey: 1, anchor: null });
    expect(window.location.pathname).toBe("/contact");
    expect(window.history.length).toBe(before + 1);
  });

  it("re-selecting the current view goes to its anchor without adding history or remounting", () => {
    const result = start("/");
    const before = window.history.length;

    act(() => result.current[1](VIEW.work, "enterprise-cases", { smooth: true }));

    expect(result.current[0]).toMatchObject({
      view: VIEW.work,
      key: 1,
      viewKey: 0,
      anchor: "enterprise-cases",
      smooth: true,
    });
    expect(window.location.hash).toBe("#enterprise-cases");
    expect(window.history.length).toBe(before);
  });

  it("never scrolls a new view smoothly: it starts at its top at once, while it fades in", () => {
    const result = start("/about");

    act(() => result.current[1](VIEW.work, null, { smooth: true }));
    expect(result.current[0]).toMatchObject({ view: VIEW.work, viewKey: 1, smooth: false });

    act(() => result.current[1](VIEW.about, "career", { smooth: true }));
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: "career", viewKey: 2, smooth: false });

    // A jump within the view keeps it.
    act(() => result.current[1](VIEW.about, "faq", { smooth: true }));
    expect(result.current[0]).toMatchObject({ view: VIEW.about, anchor: "faq", viewKey: 2, smooth: true });
  });

  it("shows a tracker only new views: the first address and same-view jumps go past its wrapper", () => {
    window.history.replaceState(null, "", "/resume");
    // Umami's tracker wraps the methods on the history object itself; it takes each call as a new page.
    const replace = vi.fn();
    const push = vi.fn((...args: Parameters<History["pushState"]>) => {
      History.prototype.pushState.apply(window.history, args);
    });
    Object.assign(window.history, { replaceState: replace, pushState: push });
    try {
      const result = renderHook(() => useHistoryRoute()).result;
      expect(window.location.pathname).toBe("/cv"); // the alias, normalised
      act(() => result.current[1](VIEW.cv, "experience"));
      expect(window.location.hash).toBe("#experience");
      act(() => result.current[1](VIEW.contact));
      // Saving the scroll position passes no address, which the tracker ignores.
      expect(replace.mock.calls.filter((args: unknown[]) => args[2] !== undefined)).toEqual([]);
      expect(push).toHaveBeenCalledOnce();
    } finally {
      Reflect.deleteProperty(window.history, "replaceState");
      Reflect.deleteProperty(window.history, "pushState");
    }
  });

  it("restores the view and scroll position on Back / Forward", () => {
    const result = start("/");
    act(() => result.current[1](VIEW.about));

    act(() => {
      window.history.replaceState({ kbView: VIEW.caseDataGovernance, scrollY: 640 }, "", "/work/data-governance");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { kbView: VIEW.caseDataGovernance, scrollY: 640 } }));
    });

    expect(result.current[0]).toMatchObject({ view: VIEW.caseDataGovernance, restoreY: 640, key: 2, viewKey: 2 });
  });

  it("never writes to the history while scrolling (in-app browsers show a loading bar on each write)", async () => {
    start("/about");
    // On the prototype: replaceAddress() calls it there, past a tracker's wrapper on window.history.
    const replace = vi.spyOn(History.prototype, "replaceState");
    const push = vi.spyOn(History.prototype, "pushState");
    for (const y of [120, 480, 900]) {
      scrollTo(y);
      window.dispatchEvent(new Event("scroll"));
    }
    // Longer than the old save delay (300 ms after scrolling stopped).
    await act(() => new Promise<void>((resolve) => window.setTimeout(resolve, 400)));
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    scrollTo(0);
  });

  it("brings back each entry's scroll position on Back and Forward, kept in memory", () => {
    const result = start("/");
    const work = window.history.state as unknown;
    scrollTo(350); // reading the Work page, then opening About
    act(() => result.current[1](VIEW.about));
    const about = window.history.state as unknown;

    scrollTo(800); // reading About, then Back
    act(() => travelTo(work, "/"));
    expect(result.current[0]).toMatchObject({ view: VIEW.work, restoreY: 350 });

    scrollTo(350); // Forward: About's position was never written to its entry, only remembered
    act(() => travelTo(about, "/about"));
    expect(result.current[0]).toMatchObject({ view: VIEW.about, restoreY: 800 });
    scrollTo(0);
  });

  it("writes the position into the entry once, when the page is hidden", () => {
    start("/contact");
    scrollTo(640);
    window.dispatchEvent(new Event("pagehide"));
    expect(window.history.state).toMatchObject({ kbView: VIEW.contact, scrollY: 640 });
    scrollTo(0);
  });

  it("with hash routing, keeps the page's path and moves between views in the hash", () => {
    setHashRouting(true);
    try {
      const result = start("/artifact-page.html#/about");
      expect(result.current[0]).toMatchObject({ view: VIEW.about });

      act(() => result.current[1](VIEW.caseProjectPlanning));
      expect(window.location.pathname + window.location.hash).toBe("/artifact-page.html#/work/project-planning");

      act(() => result.current[1](VIEW.work, "enterprise-cases"));
      expect(window.location.pathname + window.location.hash).toBe("/artifact-page.html#/#enterprise-cases");
    } finally {
      setHashRouting(false);
    }
  });
});
