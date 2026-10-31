import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PageSpot } from "./analytics.types.ts";
import { describeClick, isInteractive, watchCopies, watchDeadClicks } from "./clicks.utils.ts";

/**
 * A page like the site's: a hero, an anchored section with a card, an unlabelled region, a case study's comparison,
 * captioned screens and stat card, a testimonial, header, footer, viewer.
 */
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
    <section aria-labelledby="_r_1_"><p id="consent">Can I Count Your Visit?</p></section>
    <section id="ticket-rebuild" data-anchor="">
      <article id="compare" data-card="" aria-labelledby="_r_2_">
        <h3 id="_r_2_">Sign-up, 2022 and today</h3>
        <p id="compare-text">Hard-coded greys.</p>
        <figure id="compare-figure">
          <button type="button"><img alt="2022 sign-up screen" src="/c.webp"></button>
          <figcaption id="compare-caption">Sign-up, 2022</figcaption>
        </figure>
      </article>
      <figure id="screen-figure">
        <img id="screen" alt="" src="/d.webp"><figcaption>Live <em id="screen-caption">fleet</em> map</figcaption>
      </figure>
      <ul>
        <li><div id="stat" data-card=""><p id="stat-title" data-card-title="">AA+</p><p id="stat-label">Contrast.</p></div></li>
      </ul>
    </section>
    <section id="testimonials" data-anchor="">
      <figure data-card="">
        <blockquote><p id="quote">A quote.</p></blockquote><figcaption id="author">A person</figcaption>
      </figure>
    </section>
  </main>
  <footer><p id="copyright">2026 Karolina Kita</p></footer>
  <dialog id="viewer" open><figure id="full-figure"><img id="full" alt="Full size" src="/b.webp"></figure></dialog>
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
    // Any other article is not a card.
    expect(describeClick($("role-body"))).toEqual({ element: "text", area: "philosophy" });
  });

  it("names a block marked as a card by its title, also when React made the title's id", () => {
    const comparison = { area: "ticket-rebuild", label: "Sign-up, 2022 and today" };
    expect(describeClick($("compare"))).toEqual({ element: "card", ...comparison });
    expect(describeClick($("compare-text"))).toEqual({ element: "text", ...comparison });
  });

  it("names a screenshot by its caption, inside a card or not: people expect it to open the image", () => {
    const caption = { area: "ticket-rebuild", label: "Sign-up, 2022" };
    expect(describeClick($("compare-caption"))).toEqual({ element: "text", ...caption });
    const screen = { area: "ticket-rebuild", label: "Live fleet map" };
    expect(describeClick($("screen-caption"))).toEqual({ element: "text", ...screen });
    // An image without alt text goes by its caption.
    expect(describeClick($("screen"))).toEqual({ element: "image", ...screen });
  });

  it("counts the frame around a captioned screenshot as the image, a figure without a caption as the page", () => {
    expect(describeClick($("compare-figure"))).toEqual({
      element: "image",
      area: "ticket-rebuild",
      label: "Sign-up, 2022",
    });
    expect(describeClick($("screen-figure"))).toEqual({
      element: "image",
      area: "ticket-rebuild",
      label: "Live fleet map",
    });
    expect(describeClick($("full-figure"))).toEqual({ element: "page", area: "dialog" });
  });

  it("names a card without a heading by its marked title (a stat card's figure)", () => {
    const stat = { area: "ticket-rebuild", label: "AA+" };
    expect(describeClick($("stat"))).toEqual({ element: "card", ...stat });
    expect(describeClick($("stat-label"))).toEqual({ element: "text", ...stat });
  });

  it("never names a card by its caption: a testimonial's caption names a person", () => {
    expect(describeClick($("quote"))).toEqual({ element: "text", area: "testimonials" });
    expect(describeClick($("author"))).toEqual({ element: "text", area: "testimonials" });
  });

  it("falls back to the landmark when a region's id is React's own (not stable between builds)", () => {
    expect(describeClick($("consent"))).toEqual({ element: "text", area: "main" });
    expect(describeClick($("tagline"))).toEqual({ element: "text", area: "header" });
    expect(describeClick($("copyright"))).toEqual({ element: "text", area: "footer" });
    expect(describeClick(document.body)).toEqual({ element: "page", area: "page" });
  });
});

describe("watchDeadClicks", () => {
  const report = vi.fn<(click: PageSpot, rage: boolean) => void>();
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

  it("ignores a mouse click on what reacts to a mouse only, and still reports a tap on it", () => {
    $("full").setAttribute("data-mouse-click", ""); // the image viewer's image: a click zooms it
    fireEvent.pointerDown($("full"), { pointerType: "mouse", clientX: 100, clientY: 100 });
    fireEvent.click($("full"), { detail: 1, clientX: 100, clientY: 100 });
    expect(report).not.toHaveBeenCalled();

    fireEvent.pointerDown($("full"), { pointerType: "touch", clientX: 300, clientY: 300 });
    fireEvent.click($("full"), { detail: 1, clientX: 300, clientY: 300 });
    expect(report).toHaveBeenCalledExactlyOnceWith({ element: "image", area: "dialog", label: "Full size" }, false);
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

describe("watchCopies", () => {
  it("reports where copied text was: the card and section, never the text", () => {
    const report = vi.fn<(spot: PageSpot) => void>();
    const stop = watchCopies(report);
    window.getSelection()?.selectAllChildren($("summary"));
    document.dispatchEvent(new Event("copy"));
    expect(report).toHaveBeenCalledExactlyOnceWith({
      element: "text",
      area: "enterprise-cases",
      label: "Automotive marketplace",
    });

    stop();
    document.dispatchEvent(new Event("copy"));
    expect(report).toHaveBeenCalledOnce();
  });

  it("never sends the copied text as the label: a heading, caption or stat the selection reaches is skipped", () => {
    const report = vi.fn<(spot: PageSpot) => void>();
    const stop = watchCopies(report);
    /** Selects from the start of `anchor` to the end of `focus`, or backwards when `focus` comes first. */
    const copy = (anchor: Element, focus = anchor, backwards = false) => {
      const [start, end] = backwards ? [anchor.childNodes.length, 0] : [0, focus.childNodes.length];
      window.getSelection()?.setBaseAndExtent(anchor, start, focus, end);
      document.dispatchEvent(new Event("copy"));
    };
    copy($("compare-caption")); // the card's title names it instead
    copy($("screen-caption"));
    copy($("stat-title"));
    copy($("case-a"));
    copy($("summary"), $("case-a"), true); // from the text up into the card's heading
    expect(report.mock.calls.map(([spot]) => spot)).toEqual([
      { element: "text", area: "ticket-rebuild", label: "Sign-up, 2022 and today" },
      { element: "text", area: "ticket-rebuild" },
      { element: "text", area: "ticket-rebuild" },
      { element: "heading", area: "enterprise-cases" },
      { element: "text", area: "enterprise-cases" },
    ]);
    stop();
  });

  it("reports nothing when nothing is selected", () => {
    const report = vi.fn<(spot: PageSpot) => void>();
    const stop = watchCopies(report);
    document.dispatchEvent(new Event("copy"));
    expect(report).not.toHaveBeenCalled();
    stop();
  });
});
