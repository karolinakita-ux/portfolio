import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANCHOR_HELD_ATTRIBUTE } from "./anchor.constants.ts";

/** The section-link script in index.html: it runs when the parser reaches it, right after the page's HTML. */
const SCRIPT = /<script>\s*(\(function \(\) \{\s*var hash = location\.hash[\s\S]*?\}\)\(\);)\s*<\/script>/.exec(
  readFileSync(join(process.cwd(), "index.html"), "utf8"),
)?.[1];

/*
 * jsdom has no layout, so the page is a model: the About page's Career section starts 2000px down the page and its
 * heading 64px below that; the window scrolls by `scrollY`. An anchor jump to the heading puts it at 147px (the
 * 107px header, 16px padding, 24px scroll margin). The browser's own jump to the hash puts the section at the top of
 * the scroll area, which is 0 here (jsdom computes no scroll padding).
 */
const PAGE_TOP: Record<string, number> = { career: 2000, "career-title": 2064 };
const LANDING = 147;
let scrollY = 0;
let frames: FrameRequestCallback[] = [];
let resized: (() => void) | null = null;
const listeners: Array<Parameters<typeof window.removeEventListener>> = [];

const topOf = (element: Element) => (PAGE_TOP[element.id] ?? 0) - scrollY;
const heading = () => document.getElementById("career-title");

/** Runs the animation frames queued so far, and the ones they queue in turn. */
function runFrames(): void {
  for (let i = 0; i < 10 && frames.length > 0; i++) {
    const queued = frames;
    frames = [];
    for (const frame of queued) frame(0);
  }
}

/** Opens `url` on a page whose HTML holds the sticky header and the Career section, then runs the script. */
function open(url: string) {
  window.history.replaceState(null, "", url);
  document.body.innerHTML =
    '<div id="root"><header class="kb-site-header" style="position: sticky"></header><main>' +
    '<section id="career"><h2 id="career-title" tabindex="-1">Career Progression</h2></section></main></div>';
  const header = document.querySelector(".kb-site-header");
  if (header) Object.defineProperty(header, "offsetHeight", { value: 107, configurable: true });
  const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(function (this: Element) {
    scrollY = (PAGE_TOP[this.id] ?? 0) - LANDING;
  });
  // The script calls scrollTo(x, y).
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation((...args: unknown[]) => {
    if (typeof args[1] === "number") scrollY = args[1];
  });
  if (SCRIPT === undefined) throw new Error("index.html has no section-link script");
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs the page's own inline script, as the browser does
  (new Function(SCRIPT) as () => void)();
  return { scrollIntoView, scrollTo };
}

/** The window scrolls to `y` by any means other than the script, and the browser reports it. */
function scrollBy(y: number): void {
  scrollY = y;
  window.dispatchEvent(new Event("scroll"));
}

beforeEach(() => {
  scrollY = 0;
  frames = [];
  resized = null;
  Object.defineProperty(window, "scrollY", { get: () => scrollY, configurable: true });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    return { top: topOf(this) } as DOMRect;
  });
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => frames.push(frame));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resized = callback;
      }
      observe() {}
      disconnect() {
        resized = null;
      }
    },
  );
  const add = window.addEventListener.bind(window);
  vi.spyOn(window, "addEventListener").mockImplementation((...args: Parameters<typeof window.addEventListener>) => {
    listeners.push([args[0], args[1], typeof args[2] === "object" ? Boolean(args[2].capture) : args[2]]);
    add(...args);
  });
});

afterEach(() => {
  for (const args of listeners.splice(0)) window.removeEventListener(...args);
  document.documentElement.removeAttribute(ANCHOR_HELD_ATTRIBUTE);
  document.body.innerHTML = "";
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
});

describe("the section-link script in index.html", () => {
  it("puts the section's heading below the header as soon as the HTML is in, and tells the app", () => {
    const { scrollIntoView } = open("/about#career");
    expect(scrollIntoView.mock.contexts).toEqual([heading()]);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(document.documentElement.style.getPropertyValue("--kb-header-h")).toBe("107px");
    expect(document.documentElement).toHaveAttribute(ANCHOR_HELD_ATTRIBUTE);
    expect(scrollY).toBe(2064 - LANDING);
  });

  it.each(["/about#career?fbclid=IwAR0abc", "/about?ref=section-link#career&fbclid=IwAR0abc"])(
    "reads the section up to ? or & in %s, as readRoute does",
    (url) => {
      const { scrollIntoView } = open(url);
      expect(scrollIntoView.mock.contexts).toEqual([heading()]);
    },
  );

  it.each(["/about", "/about#unknown-section", "/#/about#career", "/about#%E0%A4%A"])(
    "leaves %s to the app: no section of that name in the HTML",
    (url) => {
      const { scrollIntoView } = open(url);
      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(document.documentElement).not.toHaveAttribute(ANCHOR_HELD_ATTRIBUTE);
    },
  );

  it("keeps the heading in place while the window resizes and the page settles", () => {
    const { scrollIntoView } = open("/about#career");
    PAGE_TOP["career-title"] = 2164; // the in-app browser's keyboard closed: the header is sticky again
    try {
      window.dispatchEvent(new Event("resize"));
      expect(scrollY).toBe(2164 - LANDING);
      resized?.(); // fonts, the consent box
      expect(scrollIntoView).toHaveBeenCalledTimes(3);
    } finally {
      PAGE_TOP["career-title"] = 2064;
    }
  });

  it.each(["touchstart", "wheel", "keydown", "pointerdown", "popstate"])(
    "lets go at the visitor's first %s: a later resize leaves the page where it is",
    (type) => {
      const { scrollIntoView } = open("/about#career");
      window.dispatchEvent(new Event(type));
      window.dispatchEvent(new Event("resize"));
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(resized).toBeNull();
    },
  );

  it("lets go when the page scrolls away by itself (a screen reader, find in page)", () => {
    const { scrollIntoView } = open("/about#career");
    scrollBy(1200);
    window.dispatchEvent(new Event("resize"));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollY).toBe(1200);
  });

  it("puts the browser's own jump to the section right: the heading stays below the header", () => {
    const { scrollIntoView } = open("/about#career");
    window.dispatchEvent(new Event("DOMContentLoaded"));
    scrollBy(2000); // the browser scrolls the section to the top
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollY).toBe(2064 - LANDING);
  });

  it("undoes the browser's jump once the visitor has scrolled: they keep their place", () => {
    const { scrollTo } = open("/about#career");
    window.dispatchEvent(new Event("touchstart"));
    scrollBy(1300);
    window.dispatchEvent(new Event("DOMContentLoaded"));
    scrollBy(2000);
    expect(scrollTo).toHaveBeenCalledWith(0, 1300);
    expect(scrollY).toBe(1300);
  });

  it("watches for that jump only in the frames after DOMContentLoaded and load", () => {
    const { scrollTo } = open("/about#career");
    window.dispatchEvent(new Event("touchstart"));
    window.dispatchEvent(new Event("load"));
    runFrames();
    scrollBy(2000); // the visitor's own scroll to the section's top
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollY).toBe(2000);
  });
});
