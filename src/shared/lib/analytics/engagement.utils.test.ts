import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as Engagement from "./engagement.utils.ts";

/** The module keeps the page's count: each test gets a fresh copy. */
let engagement: typeof Engagement;
let stop: () => void;
const onStretch = vi.fn();

const setVisibility = (value: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", { value, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
};

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  engagement = await import("./engagement.utils.ts");
  stop = engagement.watchEngagement(onStretch);
});

afterEach(() => {
  stop();
  onStretch.mockReset();
  vi.useRealTimers();
  Reflect.deleteProperty(document, "visibilityState");
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true }); // jsdom's own: deleting it leaves undefined
  Reflect.deleteProperty(document.documentElement, "scrollHeight");
  document.body.innerHTML = "";
});

describe("buckets", () => {
  it("group seconds and scroll depth the way the dashboard lists them", () => {
    expect([0, 9, 10, 29, 30, 59, 60, 179, 180, 599, 600].map(engagement.timeBucket)).toEqual([
      "under 10 s",
      "under 10 s",
      "10 - 30 s",
      "10 - 30 s",
      "30 s - 1 min",
      "30 s - 1 min",
      "1 - 3 min",
      "1 - 3 min",
      "3 - 10 min",
      "3 - 10 min",
      "over 10 min",
    ]);
    expect([0, 0.24, 0.25, 0.74, 0.75, 0.99, 1].map(engagement.scrollBucket)).toEqual([
      "under 25%",
      "under 25%",
      "25%",
      "50%",
      "75%",
      "75%",
      "100%",
    ]);
  });
});

describe("engaged time", () => {
  it("counts while the visitor is active, and stops 30 s after the last sign of them", () => {
    engagement.startPage();
    vi.advanceTimersByTime(20_000);
    expect(engagement.endStretch()?.seconds).toBe(20);

    // No scroll, key, tap or mouse move: 30 s more count, then nothing.
    vi.advanceTimersByTime(60_000);
    expect(engagement.endStretch()?.seconds).toBe(30);
    vi.advanceTimersByTime(10_000);
    expect(engagement.endStretch()).toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    vi.advanceTimersByTime(5_000);
    expect(engagement.endStretch()).toMatchObject({ seconds: 5, time: "under 10 s" });
  });

  it("ends a stretch when the tab hides, skips the hidden time, and ends the next one when the page closes", () => {
    engagement.startPage();
    vi.advanceTimersByTime(12_000);
    setVisibility("hidden");
    expect(onStretch).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ seconds: 12, time: "10 - 30 s" }));

    vi.advanceTimersByTime(60_000);
    setVisibility("visible");
    vi.advanceTimersByTime(3_000);
    window.dispatchEvent(new Event("pagehide"));
    expect(onStretch).toHaveBeenCalledTimes(2);
    expect(onStretch).toHaveBeenLastCalledWith(expect.objectContaining({ seconds: 3 }));

    // Browsers fire visibilitychange and pagehide together on closing: one stretch, not two.
    setVisibility("hidden");
    expect(onStretch).toHaveBeenCalledTimes(2);
  });

  it("sends nothing for less than a second", () => {
    engagement.startPage();
    vi.advanceTimersByTime(400);
    expect(engagement.endStretch()).toBeNull();
  });

  it("stops listening and drops what was counted when statistics go off", () => {
    engagement.startPage();
    vi.advanceTimersByTime(5_000);
    stop();
    setVisibility("hidden");
    expect(onStretch).not.toHaveBeenCalled();
    expect(engagement.endStretch()).toBeNull();
  });
});

describe("scroll depth and sections", () => {
  /** Three sections; `tops` places them in the viewport (768 px high in jsdom). */
  const layout = (scrollY: number, tops: readonly number[]) => {
    Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
    document.querySelectorAll("section").forEach((section, index) => {
      vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: tops[index] ?? 0 } as DOMRect);
    });
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(20); // the next animation frame
  };

  beforeEach(() => {
    document.body.innerHTML = `<main>${["intro", "process", "results"]
      .map((id) => `<section id="${id}" data-anchor=""></section>`)
      .join("")}</main>`;
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 4000, configurable: true });
  });

  it("keep the furthest point seen, read only once the page has stood still", () => {
    engagement.startPage();
    layout(3000, [-2000, -1000, 100]); // a new view starts at the old position, then glides up
    vi.advanceTimersByTime(200);
    layout(0, [0, 1000, 2000]);
    vi.advanceTimersByTime(1300);
    expect(engagement.endStretch()).toEqual({
      time: "under 10 s",
      seconds: 2,
      scroll: "under 25%",
      section: "intro",
    });

    layout(1300, [-1300, -300, 700]);
    layout(0, [0, 1000, 2000]);
    vi.advanceTimersByTime(1000);
    expect(engagement.endStretch()).toMatchObject({ scroll: "50%", section: "process" });

    // At the bottom, the short last section counts although its top never reaches the middle.
    layout(3232, [-3232, -2232, 500]);
    vi.advanceTimersByTime(1000);
    expect(engagement.endStretch()).toMatchObject({ scroll: "100%", section: "results" });
  });

  it("start again on a new page", () => {
    engagement.startPage();
    vi.advanceTimersByTime(500);
    layout(3232, [-3232, -2232, 500]);
    expect(engagement.endStretch()).toMatchObject({ scroll: "100%", section: "results" });

    engagement.startPage();
    layout(0, [0, 1000, 2000]); // the new view goes to the top
    vi.advanceTimersByTime(1000);
    expect(engagement.endStretch()).toEqual({ time: "under 10 s", seconds: 1, scroll: "under 25%", section: "intro" });
  });
});
