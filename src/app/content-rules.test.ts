import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES } from "#features/about/about.content.ts";
import type { CaseStudy, ShowcaseCard, ThemingCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { THEMING_CASE } from "#features/case-studies/content/theming.content.tsx";
import { CONTACT } from "#features/contact/contact.content.ts";
import { CV } from "#features/cv/cv.content.ts";
import { formatMonthYear } from "#features/cv/dates/dates.utils.ts";
import { PROCESS_BANNER, TESTIMONIALS, WORK_CASES, WORK_INTRO } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { isView } from "#shared/lib/routes/routes.utils.ts";
import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { Strong } from "#shared/ui/Strong/Strong.tsx";

/** Image path under /assets: lowercase kebab-case folders and file name, web image formats. */
const ASSET_PATH = /^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(png|jpe?g|webp)$/;

/**
 * Content rules for the portfolio copy, so they hold for every future edit:
 *   - Short hyphens with spaces ("word - word", "2019 - 2026"), never en or em dashes.
 *   - The CV is plain text for ATS parsers: no curly quotes either.
 *   - H1 headings never end with a trailing period.
 *   - Every case-study bullet opens with a bold lead-in term and a colon.
 *   - Navigation targets and image file names are valid on Netlify (Linux: case-sensitive).
 */

/** Every visible string inside content data, including text inside JSX (bullets, swatches). */
function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value === null || value === undefined || typeof value === "boolean" || typeof value === "number") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (isValidElement(value)) return collectText((value.props as { children?: ReactNode }).children);
  if (typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}

const CASES: ReadonlyArray<CaseStudy | ThemingCaseStudy> = [AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, THEMING_CASE];

const caseCards = (c: CaseStudy | ThemingCaseStudy): ShowcaseCard[] =>
  "sections" in c ? c.sections.flatMap((section) => [...section.cards]) : [...c.solution, ...c.safety];

const ALL_CONTENT = {
  ABOUT_INTRO,
  FAQ,
  MILESTONES,
  PRINCIPLES,
  CONTACT,
  CV,
  PROFILE,
  PROCESS_BANNER,
  TESTIMONIALS,
  WORK_CASES,
  WORK_INTRO,
  CASES,
};

describe("copy style", () => {
  it("uses short hyphens, never en or em dashes", () => {
    const offending = collectText(ALL_CONTENT).filter((text) => /[–—]/.test(text));
    expect(offending).toEqual([]);
  });

  it("keeps the CV ATS-safe (no curly quotes)", () => {
    const offending = collectText({ CV }).filter((text) => /[‘’“”]/.test(text));
    expect(offending).toEqual([]);
  });

  it("never ends an H1 with a period", () => {
    const h1s = [...CASES.map((c) => c.title), CONTACT.title];
    for (const title of h1s) expect(title.trimEnd()).not.toMatch(/\.$/);
  });
});

const CASE_TABLE = CASES.map((c): [string, CaseStudy | ThemingCaseStudy] => [c.shortTitle, c]);

describe.each(CASE_TABLE)("case study: %s", (_name, c) => {
  const cards = caseCards(c);
  const { view } = c;

  it("names its own case view (the screenshot folder below checks which one)", () => {
    expect(view.startsWith("case-")).toBe(true);
  });

  it("opens every bullet with a bold lead-in term and a colon", () => {
    const bullets: ReactNode[] = [...cards.flatMap((card) => card.bullets ?? []), ...("reality" in c ? c.reality : [])];
    for (const bullet of bullets) {
      expect(isValidElement(bullet), "bullet must be JSX (use lead())").toBe(true);
      const children = (bullet as ReactElement<{ children?: ReactNode }>).props.children;
      const first: ReactNode = Array.isArray(children) ? (children as ReactNode[])[0] : children;
      expect(
        isValidElement(first) && first.type === Strong,
        `first child must be <Strong>: ${collectText(bullet).join("")}`,
      ).toBe(true);
      expect(collectText(first).join("")).toMatch(/\S:$/);
    }
  });

  it("links prev / next to other existing views", () => {
    for (const target of [c.prev, c.next]) {
      if (!target) continue;
      expect(isView(target.view)).toBe(true);
    }
  });

  it("uses unique keys (card ids, meta labels, summary openings)", () => {
    const unique = (values: string[]) => expect(new Set(values).size).toBe(values.length);
    unique(cards.map((card) => card.id));
    unique(c.meta.map((entry) => entry.label));
    unique(c.summary.map((paragraph) => paragraph.slice(0, 24)));
  });

  it("marks Polish phrases in case studies with lang=pl (WCAG 3.1.2)", () => {
    const POLISH_LETTERS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
    const unmarked: string[] = [];
    const walk = (value: unknown, inPolish: boolean): void => {
      if (typeof value === "string") {
        if (!inPolish && POLISH_LETTERS.test(value)) unmarked.push(value.trim());
      } else if (Array.isArray(value)) value.forEach((v) => walk(v, inPolish));
      else if (isValidElement(value)) {
        const props = value.props as { children?: ReactNode; lang?: string };
        walk(props.children, inPolish || (value.type === Lang && props.lang === "pl"));
      } else if (value !== null && typeof value === "object") Object.values(value).forEach((v) => walk(v, inPolish));
    };
    walk(c, false);
    expect(unmarked).toEqual([]);
  });

  it("keeps screenshots in the case's own folder, named in lowercase kebab-case (Netlify paths are case-sensitive)", () => {
    const folder = "cases/" + VIEW_PATHS[view].split("/").pop() + "/";
    for (const card of cards) {
      expect(card.asset).toMatch(ASSET_PATH);
      expect(card.asset.startsWith(folder), card.asset).toBe(true);
      if (card.detail) expect(card.detail).toMatch(ASSET_PATH);
    }
  });
});

describe("work page", () => {
  it("lists every case study exactly once, each pointing at a case view", () => {
    const caseViews = VIEWS.filter((view) => view.startsWith("case-"));
    expect(WORK_CASES.map((item) => item.view).sort()).toEqual([...caseViews].sort());
  });

  it("uses unique, valid thumbnail names", () => {
    const assets = WORK_CASES.map((item) => item.asset);
    expect(new Set(assets).size).toBe(assets.length);
    for (const asset of assets) expect(asset).toMatch(ASSET_PATH);
  });

  it("chains case studies in the same order as the Work page", () => {
    const order = WORK_CASES.map((item) => item.view);
    const byView = {
      "case-automotive": AUTOMOTIVE_CASE,
      "case-project-planning": PROJECT_PLANNING_CASE,
      "case-theming": THEMING_CASE,
    };
    order.forEach((view, index) => {
      const c = byView[view as keyof typeof byView];
      const next = order[index + 1];
      if (next) expect(c.next?.view).toBe(next);
    });
  });
});

describe("CV", () => {
  it("uses valid ISO dates", () => {
    for (const role of [...CV.experience, ...CV.education]) {
      expect(() => formatMonthYear(role.start)).not.toThrow();
      if (role.end) expect(() => formatMonthYear(role.end ?? "")).not.toThrow();
    }
  });

  it("writes lead-ins without their own colon (the layout adds it)", () => {
    const leads = CV.experience.flatMap((role) => role.bullets).map((bullet) => bullet.lead);
    for (const lead of leads) expect(lead).not.toMatch(/:\s*$/);
  });

  it("shares contact details with the profile", () => {
    expect(CV.header.email).toBe(PROFILE.email);
    expect(CV.header.linkedin.href).toBe(PROFILE.linkedinUrl);
    expect(PROFILE.linkedinRecommendationsUrl.startsWith(PROFILE.linkedinUrl + "/")).toBe(true);
  });

  it("links every recommendation to LinkedIn pages of its author and company", () => {
    for (const item of TESTIMONIALS) {
      expect(item.profileUrl).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/$/);
      expect(item.company.url).toMatch(/^https:\/\/www\.linkedin\.com\/company\/[\w-]+\/$/);
      expect(item.role).not.toContain("|"); // the company is its own field
    }
  });
});

describe("sitemap", () => {
  it("lists every page by its path, and nothing else", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>https:\/\/karolina\.kita\.company(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs)).toEqual(new Set(VIEWS.map((view) => VIEW_PATHS[view])));
  });
});
