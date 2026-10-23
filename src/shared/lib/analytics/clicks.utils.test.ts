import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DeadClick } from "./analytics.types.ts";
import { describeClick, isInteractive, watchDeadClicks } from "./clicks.utils.ts";

/** A page like the site's: a hero, an anchored section with a card, an unlabelled region, header, footer, viewer. */
const PAGE = `
  <header><a href="/">Home</a><p id="tagline">Senior Product Designer</p></header>
  <main>
    <section aria-labelledby="hero-title">
      <h1 id="hero-title">Hi, <span id="name">I'm Karolina</span></h1>
      <img id="portrait" alt="Karolina   smiling" src="/assets/site/portrait.webp">
    </section>
    <section id="enterprise-cases" aria-labelledby="enterprise-cases-title" data-anchor="">
      <h2 id="enterprise-cases-title" tabindex="-1">Case studies</h2>
      <article data-card="" aria-labelledby="case-a">
        <h3 id="case-a">Automotive marketplace</h3>
        <p id="summary">A summary of the case.</p>
        <div id="spacer"></div>
        <button id="expand" type="button"><img id="shot" alt="Dashboard" src="/a.webp"><svg id="icon"></svg></button>
        <a id="cta" href="/work/automotive">View Case Study</a>
        <div id="focusable" tabindex="0">Zoomed image</div>
      </article>
    </section>
    <section id="philosophy" data-anchor="">
      <ul><li id="principle" data-card=""><h3>Keep it simple</h3><p id="principle-body">Fewer steps.</p></li></ul>
      <article id="role" aria-labelledby="role-title"><h3 id="role-title">Designer</h3><p id="role-body">Work.</p></article>
    </section>
    <section aria-labelledby="_r_1_"><p id="consent">Can I count your visit?</p></section>
  </main>
  <footer><p id="copyright">2026 Karolina Kita</p></footer>
  <dialog id="viewer" open><figure><img id="full" alt="Full size" src="/b.webp"></figure></dialog>
`;

const $ = (id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error("no #" + id);
  return element;
};

beforeEach(() => {
  document.body.innerHTML = PAGE;
});

afterEach(() => {
  document.body.innerHTML = "";
  window.getSelection()?.removeAllRanges();
});

describe("isInteractive", () => {
  it("is true for links, buttons and what is inside them, focusable elements and a dialog's backdrop", () => {
    for (const id of ["cta", "expand", "shot", "icon", "focusable", "viewer"])
      expect(isInteractive($(id)), id).toBe(true);
  });

  it("is false for images, headings (also with tabindex -1) and text", () => {
    for (const id of ["portrait", "name", "enterprise-cases-title", "summary", "spacer", "full", "copyright"]) {
      expect(isInteractive($(id)), id).toBe(false);
    }
  });
});

describe("describeClick", () => {
  it("names the element, the area and a label from the site's copy", () => {
    expect(describeClick($("name"))).toEqual({ element: "heading", area: "hero", label: "Hi, I'm Karolina" });
    expect(describeClick($("portrait"))).toEqual({ element: "image", area: "hero", label: "Karolina smiling" });
    expect(describeClick($("enterprise-cases-title"))).toEqual({
      element: "heading",
      area: "enterprise-cases",
      label: "Case studies",
    });
    expect(describeClick($("summary"))).toEqual({
      element: "text",
      area: "enterprise-cases",
      label: "Automotive marketplace",
    });
    expect(describeClick($("spacer"))).toEqual({
      element: "card",
      area: "enterprise-cases",
      label: "Automotive marketplace",
    });
    expect(describeClick($("full"))).toEqual({ element: "image", area: "dialog", label: "Full size" });
  });

  it("knows a Card by data-card, whatever its tag, and names it by its first heading when it has no label", () => {
    const card = { area: "philosophy", label: "Keep it simple" };
    expect(describeClick($("principle"))).toEqual({ element: "card", ...card });
    expect(describeClick($("principle-body"))).toEqual({ element: "text", ...card });
    // Any other article (a role on the CV) is not a card.
    expect(describeClick($("role-body"))).toEqual({ element: "text", area: "philosophy" });
  });

  it("falls back to the landmark when a region's id is React's own (not stable between builds)", () => {
    expect(describeClick($("consent"))).toEqual({ element: "text", area: "main" });
    expect(describeClick($("tagline"))).toEqual({ element: "text", area: "header" });
    expect(describeClick($("copyright"))).toEqual({ element: "text", area: "footer" });
    expect(describeClick(document.body)).toEqual({ element: "page", area: "page" });
  });
});

describe("watchDeadClicks", () => {
  const report = vi.fn<(click: DeadClick, rage: boolean) => void>();
  let stop: () => void;

  /** A press and release at one spot, as a mouse or a finger makes it. */
  const click = (element: Element, x = 100, y = 100, init: MouseEventInit = {}) => {
    fireEvent.pointerDown(element, { clientX: x, clientY: y });
    fireEvent.click(element, { detail: 1, clientX: x, clientY: y, ...init });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    stop = watchDeadClicks(report);
  });

  afterEach(() => {
    stop();
    report.mockReset();
    vi.useRealTimers();
  });

  it("reports a click on something that does nothing", () => {
    click($("portrait"));
    expect(report).toHaveBeenCalledExactlyOnceWith(
      { element: "image", area: "hero", label: "Karolina smiling" },
      false,
    );
  });

  it("ignores controls and links, drags and swipes, text being selected and clicks no pointer made", () => {
    click($("shot"));
    click($("cta"));
    click($("viewer")); // the backdrop: closes the viewer
    fireEvent.pointerDown($("name"), { clientX: 10, clientY: 10 });
    fireEvent.click($("name"), { detail: 1, clientX: 60, clientY: 10 });
    window.getSelection()?.selectAllChildren($("summary"));
    click($("summary"), 300, 300);
    fireEvent.click($("copyright"), { detail: 0 }); // element.click(), or a key
    expect(report).not.toHaveBeenCalled();

    // A selection does not hide a click on an image: double clicking one can select it.
    window.getSelection()?.selectAllChildren($("enterprise-cases-title"));
    click($("portrait"), 500, 500);
    expect(report).toHaveBeenCalledOnce();
  });

  it("reports a burst of quick clicks on one spot once, and once more as a rage click at the third", () => {
    for (let i = 0; i < 5; i++) {
      click($("portrait"), 100 + i, 100);
      vi.advanceTimersByTime(200);
    }
    expect(report.mock.calls.map(([, rage]) => rage)).toEqual([false, true]);

    vi.advanceTimersByTime(1000); // a new burst after a pause
    click($("portrait"));
    click($("spacer"), 400, 400); // and right after, somewhere else
    expect(report.mock.calls.map(([dead, rage]) => [dead.element, rage])).toEqual([
      ["image", false],
      ["image", true],
      ["image", false],
      ["card", false],
    ]);
  });

  it("stops listening", () => {
    stop();
    click($("portrait"));
    expect(report).not.toHaveBeenCalled();
  });
});
