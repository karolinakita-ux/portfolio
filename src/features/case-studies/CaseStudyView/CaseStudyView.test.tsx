import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { MEETESTIM_CASE } from "#features/case-studies/content/meetestim.content.tsx";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { REVEAL, revealsAround } from "#test/reveal.ts";

import { CaseStudyView } from "./CaseStudyView.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const resolveAsset = (name: string) => "/assets/" + name;

describe.each([AUTOMOTIVE_CASE, MEETESTIM_CASE])("CaseStudyView scroll reveal ($shortTitle)", (c) => {
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

  it("keeps the outcomes still (MeetEstim)", () => {
    render(<CaseStudyView c={MEETESTIM_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const outcomes = screen.getByRole("region", { name: MEETESTIM_CASE.outcomesTitle ?? "Outcomes & Business Impact" });
    expect(revealsAround(outcomes)).toEqual([]);
  });
});
