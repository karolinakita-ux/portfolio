import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { styles as screenshot } from "#shared/media/Screenshot/Screenshot.styles.ts";
import { cardsBefore, REVEAL, revealing, revealsAround } from "#test/reveal.ts";

import { CaseSmartTicketView } from "./CaseSmartTicketView.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const resolveAsset = (name: string) => "/assets/" + name;
const c = SMART_TICKET_CASE;
const renderCase = () => render(<CaseSmartTicketView c={c} resolveAsset={resolveAsset} onNavigate={() => undefined} />);

describe("CaseSmartTicketView", () => {
  it("gives every section an H2 with its id as the URL hash", () => {
    renderCase();
    for (const section of [c.personas, c.flow, c.system, c.rebuild, c.passenger, c.operations, c.impact, c.lessons]) {
      const region = screen.getByRole("region", { name: section.title });
      expect(region).toHaveAttribute("id", section.id);
    }
  });

  it("shows the personas as text cards, one per rider", () => {
    renderCase();
    const region = screen.getByRole("region", { name: c.personas.title });
    const names = within(region)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(names).toEqual(c.personas.personas.map((persona) => persona.name));
  });

  it("shows every screenshot once, each opening the image viewer", () => {
    renderCase();
    const cards = caseCards(c);
    for (const card of cards) expect(screen.getByAltText(card.alt)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^View full size/ })).toHaveLength(cards.length);
  });

  it("shows the user flow without the screenshot frame: the image draws its own border", () => {
    renderCase();
    const flow = screen.getByAltText(c.flow.media.alt).closest("button");
    expect(flow).toHaveAttribute("class", screenshot.button(true));
  });

  it("keeps a figure and its unit on one line (no-break space: 60 s)", () => {
    renderCase();
    const text = screen.getByRole("region", { name: c.operations.title }).textContent;
    expect(text).toContain("60\u00a0s");
    expect(text).not.toMatch(/\d s\b/);
  });

  it("names the before and after measurements of each comparison", () => {
    renderCase();
    for (const comparison of c.rebuild.comparisons) {
      const block = screen.getByRole("article", { name: comparison.title });
      for (const metric of [...(comparison.before.metrics ?? []), ...(comparison.after.metrics ?? [])])
        expect(within(block).getByText(metric)).toBeInTheDocument();
    }
  });

  it("nests its headings as they read: each comparison's reasoning under it, the design files banner on its own", () => {
    renderCase();
    for (const comparison of c.rebuild.comparisons) {
      const block = within(screen.getByRole("article", { name: comparison.title }));
      const reasoning = [...(comparison.rationale ?? []), ...(comparison.shift ? [comparison.shift] : [])];
      expect(reasoning, comparison.id).not.toHaveLength(0);
      for (const { title } of reasoning) expect(block.getByRole("heading", { level: 4, name: title })).toBeVisible();
    }
    // It follows the lessons section, not part of it.
    expect(screen.getByRole("heading", { level: 2, name: c.designFile?.title })).toBeVisible();

    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.forEach((level, index) => {
      expect(level - (levels[index - 1] ?? 0), `heading ${String(index)}`).toBeLessThanOrEqual(1);
    });
  });

  it("switches the 2026 screens to their dark versions, and keeps the 2022 ones", async () => {
    renderCase();
    const themed = c.passenger.cards[0];
    const legacy = c.rebuild.comparisons[0]?.before.media[0];
    document.documentElement.classList.add("dark");
    await waitFor(() =>
      expect(screen.getByAltText(themed?.alt ?? "(none)")).toHaveAttribute(
        "src",
        "/assets/" + (themed?.darkAsset ?? ""),
      ),
    );
    expect(screen.getByAltText(legacy?.alt ?? "(none)")).toHaveAttribute("src", "/assets/" + (legacy?.asset ?? ""));
    document.documentElement.classList.remove("dark");
  });

  it("links the Smart Ticket Figma file at the top and in the design files banner", () => {
    renderCase();
    const links = screen.getAllByRole("link", { name: /^Explore the Figma File/ });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", c.designFile?.url);
      expect(link).toHaveAttribute("target", "_blank");
    }
    // The first one sits in the case intro, before the first section.
    expect(
      within(screen.getByRole("region", { name: c.title })).getByRole("link", { name: /^Explore the Figma File/ }),
    ).toBe(links[0]);
  });
});

describe("CaseSmartTicketView scroll reveal", () => {
  it("fades in every card up to the impact: personas, screenshot rows, comparisons and stat cards", () => {
    renderCase();
    const lessons = screen.getByRole("region", { name: c.lessons.title });
    expect(revealing()).toEqual(cardsBefore([lessons]));

    const personas = within(screen.getByRole("region", { name: c.personas.title })).getAllByRole("article");
    const rows = [...c.system.cards, ...c.passenger.cards].map((card) =>
      screen.getByRole("article", { name: card.title }),
    );
    const comparisons = c.rebuild.comparisons.map((comparison) =>
      screen.getByRole("article", { name: comparison.title }),
    );
    const stats = c.impact.stats.map((stat) => screen.getByText(stat.value).closest("[data-card]"));
    expect(personas).toHaveLength(c.personas.personas.length);
    for (const card of [...personas, ...rows, ...comparisons, ...stats]) expect(card).toHaveClass(REVEAL);
  });

  it("keeps the intro, the headings, the screens outside cards and the closing lessons still", () => {
    renderCase();
    const still = [
      screen.getByRole("region", { name: c.title }),
      screen.getByRole("heading", { level: 1 }),
      ...screen.getAllByRole("heading", { level: 2 }),
      screen.getByRole("region", { name: c.flow.title }),
      screen.getByRole("list", { name: c.operations.title + " - screens" }),
      screen.getByRole("region", { name: c.lessons.title }),
      screen.getByRole("navigation", { name: "Case study navigation" }),
    ];
    expect(still.flatMap(revealsAround)).toEqual([]);
  });
});
