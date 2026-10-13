import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  hrefForView,
  isView,
  navSectionFor,
  readRoute,
  resolveView,
  SECTION,
  setHashRouting,
  titleForView,
  urlForView,
  urlWithAnchor,
  VIEW,
  VIEW_PATHS,
  viewForPath,
  VIEWS,
} from "./routes.ts";

const at = (url: string) => {
  const { pathname, hash } = new URL(url, "https://karolina.kita.company");
  return readRoute({ pathname, hash });
};

describe("resolveView", () => {
  it("returns every known view unchanged", () => {
    for (const view of VIEWS) expect(resolveView(view)).toBe(view);
  });

  it.each([
    ["", VIEW.work],
    ["home", VIEW.work],
    ["landing", VIEW.work],
    ["projects", VIEW.work],
    ["resume", VIEW.cv],
  ])("maps the alias %j to %s", (alias, view) => {
    expect(resolveView(alias)).toBe(view);
  });

  it("rejects unknown ids, including Object.prototype keys", () => {
    expect(resolveView("blog")).toBeNull();
    expect(resolveView("toString")).toBeNull();
    expect(resolveView("__proto__")).toBeNull();
  });
});

describe("isView", () => {
  it("narrows strings to views", () => {
    expect(isView(VIEW.about)).toBe(true);
    expect(isView("About")).toBe(false);
  });
});

describe("VIEW_PATHS", () => {
  it("gives every view its own absolute path", () => {
    const paths = VIEWS.map((view) => VIEW_PATHS[view]);
    expect(new Set(paths).size).toBe(VIEWS.length);
    for (const path of paths) expect(path).toMatch(/^\/[a-z0-9/-]*$/);
  });

  it("keeps case studies under /work", () => {
    for (const view of VIEWS.filter((v) => v.startsWith("case-"))) expect(VIEW_PATHS[view]).toMatch(/^\/work\//);
  });
});

describe("viewForPath", () => {
  it("resolves every path, with or without a trailing slash, in any case", () => {
    for (const view of VIEWS) {
      expect(viewForPath(VIEW_PATHS[view])).toBe(view);
      expect(viewForPath(VIEW_PATHS[view] + "/")).toBe(view);
      expect(viewForPath(VIEW_PATHS[view].toUpperCase())).toBe(view);
    }
  });

  it("accepts short aliases as paths", () => {
    expect(viewForPath("/resume")).toBe(VIEW.cv);
    expect(viewForPath("/projects")).toBe(VIEW.work);
  });

  it("returns null for unknown paths", () => {
    expect(viewForPath("/blog")).toBeNull();
    expect(viewForPath("/work/unknown")).toBeNull();
  });
});

describe("readRoute", () => {
  it("reads the view from the path and the section from the hash", () => {
    expect(at("/about#career")).toEqual({ view: VIEW.about, anchor: "career" });
    expect(at("/work/project-planning")).toEqual({ view: VIEW.caseProjectPlanning, anchor: null });
  });

  it.each([
    ["/#about", VIEW.about],
    ["/#resume", VIEW.cv],
    ["/#case-theming", VIEW.caseTheming],
  ])("redirects the old hash link %s to its view", (url, view) => {
    expect(at(url)).toEqual({ view, anchor: null });
  });

  it("treats other hashes on the root as section anchors", () => {
    expect(at("/#enterprise-cases")).toEqual({ view: VIEW.work, anchor: "enterprise-cases" });
  });

  it("no longer knows the removed cover letter page", () => {
    for (const url of ["/#cover-letter", "/#letter"]) expect(at(url).view).toBe(VIEW.work);
    expect(at("/cover-letter").view).toBeNull();
  });

  it("survives malformed percent-encoding", () => {
    expect(at("/about#%E0%A4%A")).toEqual({ view: VIEW.about, anchor: null });
  });
});

describe("hrefForView", () => {
  it("links to the path, with an optional section anchor", () => {
    expect(hrefForView(VIEW.work)).toBe("/");
    expect(hrefForView(VIEW.caseTheming)).toBe("/work/data-governance");
    expect(hrefForView(VIEW.work, "enterprise-cases")).toBe("/#enterprise-cases");
  });
});

describe("address-bar URLs", () => {
  it("use the view's path, keep the query string and swap the section anchor", () => {
    expect(urlForView(VIEW.about, "career", { pathname: "/", search: "?ref=cv" })).toBe("/about?ref=cv#career");
    expect(urlWithAnchor({ pathname: "/about", search: "", hash: "#faq" }, "career")).toBe("/about#career");
    expect(urlWithAnchor({ pathname: "/about", search: "", hash: "#faq" }, null)).toBe("/about");
  });
});

describe("hash routing (one-page builds, e.g. the claude.ai artifact)", () => {
  const page = "/artifact-page.html";
  beforeEach(() => {
    setHashRouting(true);
  });
  afterEach(() => {
    setHashRouting(false);
  });

  it("links views and sections inside the hash", () => {
    expect(hrefForView(VIEW.about)).toBe("#/about");
    expect(hrefForView(VIEW.work, SECTION.workCases)).toBe("#/#enterprise-cases");
  });

  it("reads the view and the section from the hash, whatever the page's own path", () => {
    expect(readRoute({ pathname: page, hash: "" })).toEqual({ view: VIEW.work, anchor: null });
    expect(readRoute({ pathname: page, hash: "#/work/project-planning" })).toEqual({ view: VIEW.caseProjectPlanning, anchor: null });
    expect(readRoute({ pathname: page, hash: "#/about#career" })).toEqual({ view: VIEW.about, anchor: "career" });
    expect(readRoute({ pathname: page, hash: "#about" })).toEqual({ view: VIEW.about, anchor: null }); // old view hash
  });

  it("keeps the page's own path and query string in addresses", () => {
    const here = { pathname: page, search: "?ref=cv", hash: "#/about#faq" };
    expect(urlForView(VIEW.cv, null, here)).toBe(page + "?ref=cv#/cv");
    expect(urlWithAnchor(here, "career")).toBe(page + "?ref=cv#/about#career");
    expect(urlWithAnchor(here, null)).toBe(page + "?ref=cv#/about");
  });
});

describe("navSectionFor", () => {
  it("highlights Work for case studies", () => {
    expect(navSectionFor(VIEW.caseProjectPlanning)).toBe(VIEW.work);
    expect(navSectionFor(VIEW.about)).toBe(VIEW.about);
  });
});

describe("titleForView", () => {
  it("gives every view its own title", () => {
    const titles = VIEWS.map(titleForView);
    expect(new Set(titles).size).toBe(VIEWS.length);
    for (const title of titles) expect(title).toContain("Karolina Kita");
  });

  it("leads with the name on printable documents (default PDF file name)", () => {
    expect(titleForView(VIEW.cv)).toBe("Karolina Kita - CV");
  });
});
