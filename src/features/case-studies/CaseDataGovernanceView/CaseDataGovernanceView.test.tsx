import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import { cards, cardsBefore, REVEAL, revealing, revealsAround } from "#test/reveal.ts";

import { CaseDataGovernanceView } from "./CaseDataGovernanceView.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const resolveAsset = (name: string) => "/assets/" + name;

describe("CaseDataGovernanceView scroll reveal", () => {
  it("fades up the two problem cards and each screenshot card, and nothing else", () => {
    render(
      <CaseDataGovernanceView c={DATA_GOVERNANCE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />,
    );
    const problem = within(
      screen.getByRole("region", { name: "The Core Problem: Management Assumption vs. Usability Reality" }),
    ).getAllByRole("article");
    expect(problem.map((card) => within(card).getByRole("heading").textContent)).toEqual([
      "The Assumption",
      "The Reality",
    ]);
    const rows = caseCards(DATA_GOVERNANCE_CASE).map((card) => screen.getByRole("article", { name: card.title }));
    for (const card of [...problem, ...rows]) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual([...problem, ...rows]);
  });

  it("follows the case pages' rule: the roadmap, handoff and takeaways cards that close it stay still", () => {
    render(
      <CaseDataGovernanceView c={DATA_GOVERNANCE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />,
    );
    const closing = [
      screen.getByRole("region", { name: "MVP Delivery & Phased Roadmap" }),
      screen.getByRole("region", { name: "Developer Handoff & Technical Collaboration" }),
      screen.getByRole("region", { name: "Key Takeaways & Retrospective" }),
    ];
    for (const section of closing) expect(cards().filter((card) => section.contains(card)).length).toBeGreaterThan(0);
    expect(revealing()).toEqual(cardsBefore(closing));
  });

  it("keeps the intro, the headings and the closing lists still", () => {
    render(
      <CaseDataGovernanceView c={DATA_GOVERNANCE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />,
    );
    const still = [
      screen.getByRole("region", { name: CASE_NAMES[DATA_GOVERNANCE_CASE.view].title }),
      screen.getByRole("heading", { level: 2, name: "The Core Problem: Management Assumption vs. Usability Reality" }),
      screen.getByRole("region", { name: "MVP Delivery & Phased Roadmap" }),
      screen.getByRole("region", { name: "Key Takeaways & Retrospective" }),
    ];
    expect(still.flatMap(revealsAround)).toEqual([]);
  });
});
