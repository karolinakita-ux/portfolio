import { describe, expect, it } from "vitest";

import { PRERENDERED_VIEW_ATTRIBUTE } from "./hydration.constants.ts";
import { adoptsPrerenderedHtml } from "./hydration.utils.ts";

/** A #root as scripts/prerender.ts writes it for `view`, or an empty one (null). */
function root(view: string | null): HTMLElement {
  const element = document.createElement("div");
  if (view === null) return element;
  element.setAttribute(PRERENDERED_VIEW_ATTRIBUTE, view);
  element.innerHTML = "<div><main></main></div>";
  return element;
}

const at = (address: string) => {
  const { pathname, hash } = new URL(address, "https://karolina.kita.company");
  return { pathname, hash };
};

describe("adoptsPrerenderedHtml", () => {
  it.each([
    ["/", "work"],
    ["/about", "about"],
    ["/about#career", "about"],
    ["/about.html", "about"],
    ["/about/index.html", "about"],
    ["/work/automotive", "case-automotive"],
    ["/#enterprise-cases", "work"],
    // An unknown address is served 404.html (the Work HTML) and shows Work.
    ["/no-such-page", "work"],
  ])("adopts the HTML at %s, which shows %s", (address, view) => {
    expect(adoptsPrerenderedHtml(root(view), at(address))).toBe(true);
  });

  it("renders anew where the address opens another view than its HTML (an old hash link)", () => {
    expect(adoptsPrerenderedHtml(root("work"), at("/#about"))).toBe(false);
  });

  it("renders anew into an empty root (the dev server, a one-page build)", () => {
    expect(adoptsPrerenderedHtml(root(null), at("/"))).toBe(false);
  });

  it("renders anew when the HTML does not name its view", () => {
    const element = root(null);
    element.innerHTML = "<div><main></main></div>";
    expect(adoptsPrerenderedHtml(element, at("/"))).toBe(false);
  });
});
