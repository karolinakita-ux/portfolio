import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "./automotive.content.ts";
import { CaseStudyView, CaseThemingView } from "./CaseViews.tsx";
import { caseCards } from "./gallery.utils.ts";
import { PROJECT_PLANNING_CASE } from "./project-planning.content.tsx";
import { THEMING_CASE } from "./theming.content.tsx";

vi.mock("#shared/media/image-preload.ts", () => ({ preloadImages: vi.fn() }));

/** The scroll reveal utility (app.css): card lists only. */
const REVEAL = "reveal-on-scroll";

const resolveAsset = (name: string) => "/assets/" + name;

/** Elements with the reveal on `element`, around it or inside it: none for content that stays still. */
const revealsAround = (element: HTMLElement): Element[] =>
  [element.closest(`.${REVEAL}`), ...element.querySelectorAll(`.${REVEAL}`)].filter((found) => found !== null);

describe.each([AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE])("CaseStudyView scroll reveal ($shortTitle)", (c) => {
  it("fades up each screenshot card, and nothing else", () => {
    render(<CaseStudyView c={c} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const cards = caseCards(c).map((card) => screen.getByRole("article", { name: card.title }));
    for (const card of cards) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual(cards);
  });

  it("keeps the intro, the headings, the notice and the case navigation still", () => {
    render(<CaseStudyView c={c} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const still = [
      screen.getByRole("region", { name: c.title }),
      screen.getByRole("heading", { level: 1 }),
      screen.getByRole("heading", { level: 2, name: c.summaryTitle }),
      screen.getByRole("complementary", { name: c.notice?.label ?? "(no notice)" }),
      screen.getByRole("navigation", { name: "Case study navigation" }),
    ];
    expect(still.flatMap(revealsAround)).toEqual([]);
  });
});

describe("CaseStudyView scroll reveal: closing sections", () => {
  it("keeps the key outcomes and the reflections still (Automotive)", () => {
    render(<CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const outcomes = screen.getAllByRole("list", { name: "Key Outcomes" });
    expect(outcomes.length).toBeGreaterThan(0);
    const reflections = screen.getByRole("region", { name: AUTOMOTIVE_CASE.reflections?.title ?? "(no reflections)" });
    expect([...outcomes, reflections].flatMap(revealsAround)).toEqual([]);
  });

  it("keeps the outcomes still (Project Planning)", () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const outcomes = screen.getByRole("region", { name: PROJECT_PLANNING_CASE.outcomesTitle ?? "Outcomes & Business Impact" });
    expect(revealsAround(outcomes)).toEqual([]);
  });
});

describe("CaseThemingView scroll reveal", () => {
  it("fades up the two problem cards and each screenshot card, and nothing else", () => {
    render(<CaseThemingView c={THEMING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const problem = within(
      screen.getByRole("region", { name: "The Core Problem: Management Assumption vs. Usability Reality" }),
    ).getAllByRole("article");
    expect(problem.map((card) => within(card).getByRole("heading").textContent)).toEqual([
      "The Assumption",
      "The Reality",
    ]);
    const rows = caseCards(THEMING_CASE).map((card) => screen.getByRole("article", { name: card.title }));
    for (const card of [...problem, ...rows]) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual([...problem, ...rows]);
  });

  it("keeps the intro, the headings and the closing lists still", () => {
    render(<CaseThemingView c={THEMING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const still = [
      screen.getByRole("region", { name: THEMING_CASE.title }),
      screen.getByRole("heading", { level: 2, name: "The Core Problem: Management Assumption vs. Usability Reality" }),
      screen.getByRole("region", { name: "MVP Delivery & Phased Roadmap" }),
      screen.getByRole("region", { name: "Key Takeaways & Retrospective" }),
    ];
    expect(still.flatMap(revealsAround)).toEqual([]);
  });
});
