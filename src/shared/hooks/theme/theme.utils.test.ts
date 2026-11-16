import { describe, expect, it, onTestFinished, vi } from "vitest";

import { mockMatchMedia } from "#test/match-media.ts";

import { STICKY_HEADER_SELECTOR } from "./theme.constants.ts";
import { changeTheme, holdStickyHeader } from "./theme.utils.ts";

/**
 * React's own inline top on the header, which the hold must give back. SiteHeader.tsx sets the safe area,
 * `env(safe-area-inset-top, 0px)`, which jsdom drops: a 3px inset stands in for it.
 */
const REACT_TOP = "3px";
/** Held: placed against the page, 1416px down from where it would sit unstuck (as far as sticking moved it). */
const HELD = { position: "relative", top: "1416px" };
/** Released: sticky from its class again, with React's top. */
const STICKY = { position: "sticky", top: REACT_TOP };

/**
 * The site header as the page has it: sticky from its class (or static, as on short viewports), React's inline top,
 * scrolled 1416px down. Its box sits at `stuck` while it sticks, and at -1416 plus a relative top otherwise.
 */
function stickyHeader({ position = "sticky", stuck = 0 } = {}) {
  const sheet = document.createElement("style");
  sheet.textContent = `${STICKY_HEADER_SELECTOR} { position: ${position}; }`;
  const header = document.createElement("header");
  header.className = STICKY_HEADER_SELECTOR.slice(1);
  header.style.top = REACT_TOP;
  document.head.append(sheet);
  document.body.append(header);
  onTestFinished(() => {
    sheet.remove();
    header.remove();
  });
  const top = () => {
    const placed = getComputedStyle(header).position;
    if (placed === "sticky") return stuck;
    return -1416 + (placed === "relative" ? Number.parseFloat(header.style.top) || 0 : 0);
  };
  vi.spyOn(header, "getBoundingClientRect").mockImplementation(() => ({ top: top() }) as DOMRect);
  return header;
}

/** A stand-in for document.startViewTransition whose transitions finish when the test says so. */
function mockTransitions() {
  const finish: Array<(failed?: boolean) => void> = [];
  const start = vi.fn((update: () => void) => {
    update();
    const finished = new Promise<void>((resolve, reject) => {
      finish.push((failed) => {
        if (failed) reject(new Error("update failed"));
        else resolve();
      });
    });
    return { ready: Promise.resolve(), finished, updateCallbackDone: Promise.resolve() } as unknown as ViewTransition;
  });
  Object.defineProperty(document, "startViewTransition", { configurable: true, writable: true, value: start });
  onTestFinished(() => {
    Reflect.deleteProperty(document, "startViewTransition");
  });
  return { start, finish };
}

/** Lets the promise callbacks after a finished transition run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("holdStickyHeader", () => {
  it("holds a stuck header where it shows, against the page, and gives React's top back on release", () => {
    const header = stickyHeader();
    const release = holdStickyHeader();
    expect(header).toHaveStyle(HELD);
    expect(header.getBoundingClientRect().top).toBe(0);

    release();
    expect(header).toHaveStyle(STICKY);
  });

  it("gives a header that is not stuck an offset of 0", () => {
    const header = stickyHeader({ stuck: -1416 }); // at the top of the page
    const release = holdStickyHeader();
    expect(header).toHaveStyle({ position: "relative", top: "0px" });
    release();
    expect(header).toHaveStyle(STICKY);
  });

  it("leaves a static header (short viewports) and a page without one alone", () => {
    expect(holdStickyHeader()).toBeTypeOf("function");
    const header = stickyHeader({ position: "static" });
    const release = holdStickyHeader();
    expect(header).toHaveStyle({ position: "static", top: REACT_TOP });
    release();
    expect(header).toHaveStyle({ position: "static", top: REACT_TOP });
  });
});

describe("changeTheme holds the stuck header for the cross-fade", () => {
  it("holds it from before the snapshot until the transition has finished", async () => {
    mockMatchMedia(false);
    const header = stickyHeader();
    const { start, finish } = mockTransitions();
    const update = vi.fn(() => {
      expect(header, "held when the page is captured").toHaveStyle(HELD);
    });

    changeTheme(update);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
    await settle();
    expect(header, "held while the cross-fade runs").toHaveStyle(HELD);

    finish[0]?.();
    await settle();
    expect(header).toHaveStyle(STICKY);
  });

  it("keeps holding through a second switch until the last cross-fade has finished", async () => {
    mockMatchMedia(false);
    const header = stickyHeader();
    const { finish } = mockTransitions();

    changeTheme(() => undefined);
    changeTheme(() => undefined); // pressed again during the first cross-fade, which the browser then skips
    finish[0]?.();
    await settle();
    expect(header, "the second cross-fade still runs").toHaveStyle(HELD);

    finish[1]?.();
    await settle();
    expect(header).toHaveStyle(STICKY);
  });

  it("lets go when the transition fails", async () => {
    mockMatchMedia(false);
    const header = stickyHeader();
    const { finish } = mockTransitions();

    changeTheme(() => undefined);
    finish[0]?.(true);
    await settle();
    expect(header).toHaveStyle(STICKY);
  });

  it("does not touch it without a cross-fade (no view transitions, reduced motion)", () => {
    mockMatchMedia(false);
    const header = stickyHeader();
    const update = vi.fn();
    expect(document).not.toHaveProperty("startViewTransition"); // jsdom
    changeTheme(update);
    expect(update).toHaveBeenCalledOnce();
    expect(header).toHaveStyle(STICKY);

    mockMatchMedia(true); // reduced motion
    mockTransitions();
    changeTheme(update);
    expect(update).toHaveBeenCalledTimes(2);
    expect(header).toHaveStyle(STICKY);
  });
});
