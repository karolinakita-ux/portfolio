import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { Lang, Strong } from "../components/ui/text.tsx";
import { formatMonthYear } from "../lib/dates.ts";
import { isView, VIEWS } from "../lib/routes.ts";
import { ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES } from "./about.ts";
import { AUTOMOTIVE_CASE } from "./cases/automotive.ts";
import { PROJECT_PLANNING_CASE } from "./cases/project-planning.tsx";
import { THEMING_CASE } from "./cases/theming.tsx";
import { CONTACT } from "./contact.ts";
import { CV } from "./cv-data.ts";
import { PROFILE } from "./profile.ts";
import type { CaseStudy, ShowcaseCard, ThemingCaseStudy } from "./types.ts";
import { PROCESS_BANNER, TESTIMONIALS, WORK_CASES, WORK_INTRO } from "./work.ts";

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

  it("opens every bullet with a bold lead-in term and a colon", () => {
    const bullets: ReactNode[] = [...cards.flatMap((card) => card.bullets ?? []), ...("reality" in c ? c.reality : [])];
    for (const bullet of bullets) {
      expect(isValidElement(bullet), "bullet must be JSX (use lead())").toBe(true);
      const children = (bullet as ReactElement<{ children?: ReactNode }>).props.children;
      const first = Array.isArray(children) ? children[0] : children;
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

  it("names screenshots in lowercase kebab-case (Netlify paths are case-sensitive)", () => {
    for (const card of cards) {
      expect(card.asset).toMatch(/^[a-z0-9-]+\.(png|jpe?g|webp)$/);
      if (card.detail) expect(card.detail).toMatch(/^[a-z0-9-]+\.(png|jpe?g|webp)$/);
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
    for (const asset of assets) expect(asset).toMatch(/^[a-z0-9-]+\.(png|jpe?g|webp)$/);
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
