import { describe, expect, it } from "vitest";

import {
  hrefForView,
  isView,
  navSectionFor,
  readRoute,
  resolveView,
  titleForView,
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
