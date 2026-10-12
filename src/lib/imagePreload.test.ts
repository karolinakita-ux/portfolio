import { beforeEach, describe, expect, it, vi } from "vitest";

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

let preloadImages: typeof import("./imagePreload.ts").preloadImages;

beforeEach(async () => {
  FakeImage.requests = [];
  vi.stubGlobal("Image", FakeImage);
  vi.resetModules(); // fresh queue per test
  ({ preloadImages } = await import("./imagePreload.ts"));
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
