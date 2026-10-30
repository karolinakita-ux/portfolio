import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROFILE } from "#shared/content/profile.ts";
import { VIEW, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { titleForView } from "#shared/lib/routes/routes.utils.ts";

import { SITE_URL } from "./seo.constants.ts";
import { PAGE_DESCRIPTIONS, PAGE_NAMES } from "./seo.content.ts";
import { absoluteUrl, headFor, llmsTxt } from "./seo.utils.ts";

type Node = Record<string, unknown>;
const graph = (view: (typeof VIEWS)[number]) => headFor(view).jsonLd["@graph"] as Node[];

describe("page descriptions", () => {
  it.each(VIEWS)("%s has a search-friendly description that follows the copy rules", (view) => {
    const text = PAGE_DESCRIPTIONS[view];
    expect(text.length).toBeGreaterThan(70);
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text).not.toMatch(/[–—]/); // no long dashes
    expect(text).not.toMatch(/['"]/); // curly quotes, as in all site copy but the CV (search results show them)
  });
});

describe("headFor", () => {
  it("gives every page its own absolute canonical URL and title", () => {
    expect(new Set(VIEWS.map((view) => headFor(view).url)).size).toBe(VIEWS.length);
    expect(absoluteUrl(VIEW.work)).toBe(SITE_URL + "/");
    expect(absoluteUrl(VIEW.caseProjectPlanning)).toBe(SITE_URL + "/work/project-planning");
    for (const view of VIEWS) expect(headFor(view).title).toBe(titleForView(view));
  });

  it("marks pages about Karolina as profile pages and case studies as her creative work", () => {
    expect(graph(VIEW.about)[0]).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@id": SITE_URL + "/#person" },
    });
    expect(graph(VIEW.cv)[0]).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@id": SITE_URL + "/#person" },
    });
    expect(graph(VIEW.contact)[0]).toMatchObject({ "@type": "WebPage" });
    expect(graph(VIEW.caseAutomotive)[1]).toMatchObject({
      "@type": "CreativeWork",
      author: { "@id": SITE_URL + "/#person" },
      url: SITE_URL + "/work/automotive",
    });
  });

  it("adds a breadcrumb from Work to a case study, and from Home to the other pages", () => {
    const crumbs = (view: (typeof VIEWS)[number]) =>
      (graph(view)[0]?.breadcrumb as { itemListElement: Node[] }).itemListElement;
    expect(crumbs(VIEW.caseDataGovernance).map((item) => item.item)).toEqual([
      SITE_URL + "/",
      SITE_URL + "/work/data-governance",
    ]);
    expect(crumbs(VIEW.caseDataGovernance)[0]?.name).toBe("Work");
    for (const view of [VIEW.about, VIEW.contact, VIEW.cv, VIEW.privacy, VIEW.accessibility]) {
      expect(crumbs(view).map((item) => item.name)).toEqual(["Home", PAGE_NAMES[view]]);
      expect(crumbs(view)[0]?.item).toBe(SITE_URL + "/");
    }
    expect(crumbs(VIEW.work).map((item) => item.name)).toEqual(["Work"]);
  });
});

describe("llmsTxt", () => {
  it("links every page by its absolute URL and gives the contact details", () => {
    const text = llmsTxt();
    expect(text.startsWith("# Karolina Kita - Senior Product Designer\n")).toBe(true);
    for (const view of VIEWS) expect(text).toContain(`](${absoluteUrl(view)}): `);
    expect(text).toContain("karolina.kita.zg@gmail.com");
    expect(text).toContain(`- GitHub: ${PROFILE.githubProfileUrl}`);
    expect(text).toContain("- CV (PDF, 2 pages): https://karolina.kita.company/karolina-kita-cv.pdf");
  });
});

describe("site-wide structured data (index.html)", () => {
  it("names her LinkedIn and GitHub profiles as the same person (sameAs), as in PROFILE", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "{}";
    const nodes = (JSON.parse(json) as { "@graph": Node[] })["@graph"];
    const person = nodes.find((node) => node["@type"] === "Person");
    expect(person?.sameAs).toEqual([PROFILE.linkedinUrl, PROFILE.githubProfileUrl]);
  });
});
