import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  AUTOMOTIVE_CASE,
  DATA_GOVERNANCE_CASE,
  PROJECT_PLANNING_CASE,
  SMART_TICKET_CASE,
} from "#features/case-studies/index.ts";
import { WORK_CASES } from "#features/work/index.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { VIEW, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { isCaseView, titleForView } from "#shared/lib/routes/routes.utils.ts";

import { SITE_URL } from "./seo.constants.ts";
import { CASE_PERIODS, PAGE_DESCRIPTIONS, PAGE_NAMES } from "./seo.content.ts";
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

  it("gives every page its own description and title (Google asks for one per page)", () => {
    expect(new Set(VIEWS.map((view) => headFor(view).description)).size).toBe(VIEWS.length);
    expect(new Set(VIEWS.map((view) => headFor(view).title)).size).toBe(VIEWS.length);
  });
});

describe("headFor", () => {
  it("gives every page its own absolute canonical URL and title", () => {
    expect(new Set(VIEWS.map((view) => headFor(view).url)).size).toBe(VIEWS.length);
    expect(absoluteUrl(VIEW.work)).toBe(SITE_URL + "/");
    expect(absoluteUrl(VIEW.caseProjectPlanning)).toBe(SITE_URL + "/work/project-planning");
    for (const view of VIEWS) expect(headFor(view).title).toBe(titleForView(view));
  });

  it("marks About and the CV as profile pages, Work as her list of case studies, and each case as her work", () => {
    for (const view of [VIEW.about, VIEW.cv]) {
      expect(graph(view)[0]).toMatchObject({ "@type": "ProfilePage", mainEntity: { "@id": SITE_URL + "/#person" } });
    }
    // Google's ProfilePage guide: a home page with much else on it is not one.
    expect(graph(VIEW.work)[0]).toMatchObject({ "@type": "CollectionPage", about: { "@id": SITE_URL + "/#person" } });
    expect(graph(VIEW.work)[0]).not.toHaveProperty("mainEntity");
    expect(graph(VIEW.contact)[0]).toMatchObject({ "@type": "WebPage" });
    expect(graph(VIEW.caseAutomotive)[1]).toMatchObject({
      "@type": "CreativeWork",
      author: { "@id": SITE_URL + "/#person" },
      url: SITE_URL + "/work/automotive",
    });
  });

  it("names, pictures and dates each case study as the site shows it", () => {
    const cases = [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE];
    /** The ways the page may write one end of a period: "present", a year, or a month or quarter with its year. */
    const writtenAs = (date: string): string[] => {
      const [year = "", month = ""] = date.split("-");
      const number = Number(month);
      if (date === "..") return ["present"];
      if (!month) return [year];
      const name = new Date(2000, number - 1).toLocaleString("en-GB", { month: "long" });
      return [`${name} ${year}`, `Q${String(Math.ceil(number / 3))} ${year}`];
    };
    expect(cases.map((c) => c.view).sort()).toEqual(VIEWS.filter(isCaseView).sort());
    for (const c of cases) {
      const work = graph(c.view)[1];
      const card = WORK_CASES.find((item) => item.view === c.view);
      // The name and picture of its card on the Work page.
      expect(work?.name, c.view).toBe(card?.title);
      expect(work?.image, c.view).toBe(`${SITE_URL}/assets/${card?.asset ?? "(none)"}`);
      expect(existsSync(join(process.cwd(), "public", "assets", card?.asset ?? "(none)")), c.view).toBe(true);
      // Its period, as the Timeline or Duration line on the page says.
      const shown = c.meta.find((entry) => /^(?:Timeline|Duration)$/.test(entry.label))?.value ?? "";
      expect(CASE_PERIODS[c.view], c.view).toMatch(/^\d{4}(?:-\d{2})?\/(?:\d{4}(?:-\d{2})?|\.\.)$/);
      expect(work?.temporalCoverage, c.view).toBe(CASE_PERIODS[c.view]);
      for (const date of (CASE_PERIODS[c.view] ?? "").split("/")) {
        expect(
          writtenAs(date).some((text) => shown.includes(text)),
          `${c.view}: ${date} in "${shown}"`,
        ).toBe(true);
      }
    }
  });

  it("adds a two-step breadcrumb with the labels on the page: Work and the case's short name, or Home and the page", () => {
    const crumbs = (view: (typeof VIEWS)[number]) =>
      (graph(view)[0]?.breadcrumb as { itemListElement: Node[] } | undefined)?.itemListElement ?? [];
    const cases = [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE];
    for (const c of cases) {
      expect(crumbs(c.view).map((item) => item.name)).toEqual(["Work", c.shortTitle]);
      expect(crumbs(c.view).map((item) => item.item)).toEqual([SITE_URL + "/", absoluteUrl(c.view)]);
    }
    for (const view of [VIEW.about, VIEW.contact, VIEW.cv, VIEW.privacy, VIEW.accessibility]) {
      expect(crumbs(view).map((item) => item.name)).toEqual(["Home", PAGE_NAMES[view]]);
      expect(crumbs(view).map((item) => item.item)).toEqual([SITE_URL + "/", absoluteUrl(view)]);
    }
    for (const view of VIEWS)
      expect(crumbs(view).map((item) => item.position)).toEqual(view === VIEW.work ? [] : [1, 2]);
    // Work, the home page, shows no breadcrumb, and Google asks for at least two items.
    expect(graph(VIEW.work)[0]).not.toHaveProperty("breadcrumb");
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

  it("lists Work and its case studies in the Work page order, the pages about her, then the ones a reader can skip", () => {
    // Each "## " section with the pages it links, in order (Contact links no page of the site).
    const sections = llmsTxt()
      .split("\n## ")
      .slice(1)
      .map((section) => {
        const [heading = "", ...lines] = section.split("\n");
        const views = lines.flatMap((text) => VIEWS.filter((view) => text.includes(`](${absoluteUrl(view)}): `)));
        return [heading, views] as const;
      });
    expect(sections).toEqual([
      ["Work", [VIEW.work, ...WORK_CASES.map((item) => item.view)]],
      ["About Karolina", [VIEW.about, VIEW.contact, VIEW.cv]],
      ["Contact", []],
      ["Optional", [VIEW.privacy, VIEW.accessibility]],
    ]);
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

  it("says the site is in British English (og:locale), as the copy is spelled", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
    expect(html).toContain('<meta property="og:locale" content="en_GB" />');
  });
});
