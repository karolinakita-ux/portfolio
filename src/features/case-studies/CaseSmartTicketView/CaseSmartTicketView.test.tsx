import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { styles as screenshot } from "#shared/media/Screenshot/Screenshot.styles.ts";

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
