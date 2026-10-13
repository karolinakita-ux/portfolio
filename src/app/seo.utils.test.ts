import { describe, expect, it } from "vitest";

import { titleForView, VIEW, VIEWS } from "#shared/lib/routes.ts";

import { PAGE_DESCRIPTIONS } from "./seo.content.ts";
import { absoluteUrl, headFor, llmsTxt, SITE_URL } from "./seo.utils.ts";

type Node = Record<string, unknown>;
const graph = (view: (typeof VIEWS)[number]) => headFor(view).jsonLd["@graph"] as Node[];

describe("page descriptions", () => {
  it.each(VIEWS)("%s has a search-friendly description that follows the copy rules", (view) => {
    const text = PAGE_DESCRIPTIONS[view];
    expect(text.length).toBeGreaterThan(70);
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text).not.toMatch(/[–—‘’“”]/); // no long dashes or curly quotes
  });
});

describe("headFor", () => {
  it("gives every page its own absolute canonical URL and title", () => {
    expect(new Set(VIEWS.map((view) => headFor(view).url)).size).toBe(VIEWS.length);
    expect(absoluteUrl(VIEW.work)).toBe(SITE_URL + "/");
    expect(absoluteUrl(VIEW.caseMeetestim)).toBe(SITE_URL + "/work/meetestim");
    for (const view of VIEWS) expect(headFor(view).title).toBe(titleForView(view));
  });

  it("marks pages about Karolina as profile pages and case studies as her creative work", () => {
    expect(graph(VIEW.about)[0]).toMatchObject({
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

  it("adds a breadcrumb from Work to the page", () => {
    const crumb = graph(VIEW.caseTheming)[0]?.breadcrumb as { itemListElement: Node[] };
    expect(crumb.itemListElement.map((item) => item.item)).toEqual([
      SITE_URL + "/",
      SITE_URL + "/work/data-governance",
    ]);
  });
});

describe("llmsTxt", () => {
  it("links every page by its absolute URL and gives the contact details", () => {
    const text = llmsTxt();
    expect(text.startsWith("# Karolina Kita - Senior Product Designer\n")).toBe(true);
    for (const view of VIEWS) expect(text).toContain(`](${absoluteUrl(view)}): `);
    expect(text).toContain("karolina.kita.zg@gmail.com");
  });
});
