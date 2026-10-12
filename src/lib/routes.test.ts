import { describe, expect, it } from "vitest";
import {
  hrefForView,
  isView,
  navSectionFor,
  readViewFromLocation,
  resolveView,
  titleForView,
  urlForView,
  VIEWS,
} from "./routes.ts";

describe("resolveView", () => {
  it("returns every known view unchanged", () => {
    for (const view of VIEWS) expect(resolveView(view)).toBe(view);
  });

  it.each([
    ["", "work"],
    ["home", "work"],
    ["landing", "work"],
    ["projects", "work"],
    ["resume", "cv"],
    ["letter", "cover-letter"],
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
    expect(isView("about")).toBe(true);
    expect(isView("About")).toBe(false);
  });
});

describe("readViewFromLocation", () => {
  it.each([
    ["#about", "about"],
    ["#resume", "cv"],
    ["#cover-letter", "cover-letter"],
    ["", "work"],
  ])("reads %j as %s", (hash, view) => {
    window.history.replaceState(null, "", "/" + hash);
    expect(readViewFromLocation()).toBe(view);
  });

  it("returns null for unknown or malformed hashes", () => {
    window.history.replaceState(null, "", "/#nope");
    expect(readViewFromLocation()).toBeNull();
    window.history.replaceState(null, "", "/#%E0%A4%A");
    expect(readViewFromLocation()).toBeNull();
  });
});

describe("URLs", () => {
  it("keeps Work at the bare root and puts other views in the hash", () => {
    window.history.replaceState(null, "", "/?ref=cv");
    expect(urlForView("work")).toBe("/?ref=cv");
    expect(urlForView("about")).toBe("/?ref=cv#about");
    expect(hrefForView("work")).toBe("#");
    expect(hrefForView("case-theming")).toBe("#case-theming");
  });
});

describe("navSectionFor", () => {
  it("highlights Work for case studies", () => {
    expect(navSectionFor("case-meetestim")).toBe("work");
    expect(navSectionFor("about")).toBe("about");
  });
});

describe("titleForView", () => {
  it("gives every view its own title", () => {
    const titles = VIEWS.map(titleForView);
    expect(new Set(titles).size).toBe(VIEWS.length);
    for (const title of titles) expect(title).toContain("Karolina Kita");
  });

  it("leads with the name on printable documents (default PDF file name)", () => {
    expect(titleForView("cv")).toBe("Karolina Kita - CV");
    expect(titleForView("cover-letter")).toBe("Karolina Kita - Cover Letter");
  });
});
