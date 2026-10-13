import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as ImagePreload from "./image-preload.ts";

/** Stands in for `new Image()`: records each request; finish() fires its load event. */
class FakeImage {
  static requests: FakeImage[] = [];
  decoding = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  #src = "";
  get src() {
    return this.#src;
  }
  set src(value: string) {
    this.#src = value;
    FakeImage.requests.push(this);
  }
  finish() {
    this.onload?.();
  }
}

const requested = () => FakeImage.requests.map((image) => image.src);

let preloadImages: typeof ImagePreload.preloadImages;

beforeEach(async () => {
  FakeImage.requests = [];
  vi.stubGlobal("Image", FakeImage);
  vi.resetModules(); // fresh queue per test
  ({ preloadImages } = await import("./image-preload.ts"));
});

describe("preloadImages", () => {
  it("waits for the browser to be idle, then loads two at a time in order", () => {
    let idle: (() => void) | undefined;
    vi.stubGlobal("requestIdleCallback", (run: () => void) => {
      idle = run;
      return 1;
    });

    preloadImages(["/a.png", "/b.png", "/c.png"]);
    expect(requested()).toEqual([]);

    idle?.();
    expect(requested()).toEqual(["/a.png", "/b.png"]);

    FakeImage.requests[0]?.finish();
    expect(requested()).toEqual(["/a.png", "/b.png", "/c.png"]);
  });

  it("requests each image once", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    preloadImages(["/a.png"]);
    FakeImage.requests[0]?.finish();
    preloadImages(["/a.png", "/a.png"]);
    preloadImages(["/a.png"], { urgent: true });
    expect(requested()).toEqual(["/a.png"]);
  });

  it("starts urgent images at once, ahead of the queue", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    preloadImages(["/a.png", "/b.png", "/c.png", "/d.png"]);
    preloadImages(["/d.png", "/e.png"], { urgent: true });
    expect(requested()).toEqual(["/a.png", "/b.png"]);

    FakeImage.requests[0]?.finish();
    FakeImage.requests[1]?.finish();
    expect(requested()).toEqual(["/a.png", "/b.png", "/d.png", "/e.png"]);
  });

  it("waits for the page to finish loading first", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    Object.defineProperty(document, "readyState", { value: "interactive", configurable: true });
    try {
      preloadImages(["/a.png"]);
      expect(requested()).toEqual([]);
      window.dispatchEvent(new Event("load"));
      expect(requested()).toEqual(["/a.png"]);
    } finally {
      Reflect.deleteProperty(document, "readyState"); // back to jsdom's own getter
    }
  });

  it("falls back to a short timeout where the browser has no idle callback (Safari)", () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal("requestIdleCallback", undefined);
      preloadImages(["/a.png"]);
      expect(requested()).toEqual([]);
      vi.advanceTimersByTime(200);
      expect(requested()).toEqual(["/a.png"]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("moves on when an image fails", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    preloadImages(["/a.png", "/b.png", "/c.png"]);
    FakeImage.requests[0]?.onerror?.();
    expect(requested()).toEqual(["/a.png", "/b.png", "/c.png"]);
  });

  it("loads nothing on a 2G connection", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    Object.defineProperty(navigator, "connection", { value: { effectiveType: "slow-2g" }, configurable: true });
    try {
      preloadImages(["/a.png"]);
      expect(requested()).toEqual([]);
    } finally {
      Reflect.deleteProperty(navigator, "connection");
    }
  });

  it("loads nothing when the visitor saves data", () => {
    vi.stubGlobal("requestIdleCallback", (run: () => void) => (run(), 1));
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    try {
      preloadImages(["/a.png"]);
      preloadImages(["/b.png"], { urgent: true });
      expect(requested()).toEqual([]);
    } finally {
      Reflect.deleteProperty(navigator, "connection");
    }
  });
});
