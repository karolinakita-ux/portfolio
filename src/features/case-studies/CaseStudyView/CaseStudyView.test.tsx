import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import { cards, cardsBefore, REVEAL, revealing, revealsAround } from "#test/reveal.ts";

import { CaseStudyView } from "./CaseStudyView.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const resolveAsset = (name: string) => "/assets/" + name;

describe("CaseStudyView scroll reveal (Automotive)", () => {
  it("fades up each screenshot row, and nothing else", () => {
    render(<CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const cards = caseCards(AUTOMOTIVE_CASE).map((card) => screen.getByRole("article", { name: card.title }));
    for (const card of cards) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual(cards);
  });
});

describe("CaseStudyView scroll reveal (Project Planning)", () => {
  it("fades up the stat cards only: the feature sections stay still", () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const stats = (PROJECT_PLANNING_CASE.impact?.stats ?? []).map((stat) =>
      screen.getByText(stat.value).closest("[data-card]"),
    );
    expect(stats.length).toBeGreaterThan(0);
    for (const stat of stats) expect(stat).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual(stats);
  });
});

describe("CaseStudyView scroll reveal: every card fades in, except after the impact", () => {
  it("Automotive: the screenshot rows fade in, the numbered reflections that close it stay still", () => {
    render(<CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const reflections = screen.getByRole("region", { name: AUTOMOTIVE_CASE.reflections?.title ?? "(no reflections)" });
    expect(cards().filter((card) => reflections.contains(card)).length).toBeGreaterThan(0);
    expect(revealing()).toEqual(cardsBefore([reflections]));
  });

  it("Project Planning: it closes with the impact, so every card fades in, the stats included", () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    expect(PROJECT_PLANNING_CASE.reflections).toBeUndefined();
    expect(cards().length).toBeGreaterThan(0);
    expect(revealing()).toEqual(cards());
  });
});

describe.each([AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE])("CaseStudyView still parts ($view)", (c) => {
  it("keeps the intro, the headings, the notice and the case navigation still", () => {
    render(<CaseStudyView c={c} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const still = [
      screen.getByRole("region", { name: CASE_NAMES[c.view].title }),
      screen.getByRole("heading", { level: 1 }),
      screen.getByRole("heading", { level: 2, name: c.summaryTitle }),
      screen.getByRole("complementary", { name: c.notice?.label ?? "(no notice)" }),
      screen.getByRole("navigation", { name: "Case study navigation" }),
    ];
    expect(still.flatMap(revealsAround)).toEqual([]);
  });
});

describe("CaseStudyView feature sections (Project Planning)", () => {
  const features = PROJECT_PLANNING_CASE.features ?? [];

  it("gives each feature section an H2 region with its screenshots, which open the image viewer", () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    expect(features.length).toBeGreaterThan(0);
    for (const feature of features) {
      const region = screen.getByRole("region", { name: feature.title });
      expect(region).toHaveAttribute("id", feature.id);
      expect(within(region).getByRole("heading", { level: 2, name: feature.title })).toBeInTheDocument();
      expect(within(region).getAllByRole("button", { name: /^View full size/ })).toHaveLength(feature.media.length);
    }
  });

  it("shows the light screenshots by default", () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const first = features[0]?.media[0];
    expect(screen.getByAltText(first?.alt ?? "(none)")).toHaveAttribute("src", "/assets/" + (first?.asset ?? ""));
  });

  it("switches to the dark screenshots when the page turns dark, and back", async () => {
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const first = features[0]?.media[0];
    const image = screen.getByAltText(first?.alt ?? "(none)");
    document.documentElement.classList.add("dark");
    await waitFor(() => expect(image).toHaveAttribute("src", "/assets/" + (first?.darkAsset ?? "")));
    document.documentElement.classList.remove("dark");
    await waitFor(() => expect(image).toHaveAttribute("src", "/assets/" + (first?.asset ?? "")));
  });

  it("falls back to the light screenshot when the dark one fails", async () => {
    document.documentElement.classList.add("dark");
    render(<CaseStudyView c={PROJECT_PLANNING_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const first = features[0]?.media[0];
    const image = screen.getByAltText(first?.alt ?? "(none)");
    expect(image).toHaveAttribute("src", "/assets/" + (first?.darkAsset ?? ""));
    fireEvent.error(image);
    await waitFor(() =>
      expect(screen.getByAltText(first?.alt ?? "(none)")).toHaveAttribute("src", "/assets/" + (first?.asset ?? "")),
    );
    document.documentElement.classList.remove("dark");
  });

  it("links the case's Figma file in a new tab at the top and in the design files banner", () => {
    // No CaseStudyView case links a file right now (Project Planning's file is being cleaned), so give it one.
    const withFile = {
      ...PROJECT_PLANNING_CASE,
      designFile: {
        url: "https://www.figma.com/design/example/Planning",
        title: "Inspect the Design Files",
        body: "The Figma file holds the design system and tokens.",
        linkLabel: "Explore the Figma File",
      },
    };
    render(<CaseStudyView c={withFile} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const file = withFile.designFile;
    const links = screen.getAllByRole("link", { name: new RegExp("^" + file.linkLabel) });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", file.url);
      expect(link).toHaveAttribute("target", "_blank");
      // jsdom drops NewTabNote's leading space from the name; browsers keep it (plain-text.test.tsx checks the text).
      expect(link).toHaveAccessibleName(new RegExp("^" + file.linkLabel + " ?\\(opens in a new tab\\)$"));
    }
    const intro = screen.getByRole("region", { name: CASE_NAMES[PROJECT_PLANNING_CASE.view].title });
    expect(intro).toContainElement(links[0] ?? null);
  });

  it("shows no Figma link when the case has no design file", () => {
    render(<CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    expect(screen.queryByRole("link", { name: /Figma file/i })).not.toBeInTheDocument();
  });
});

describe("CaseStudyView scroll reveal: closing sections", () => {
  it("keeps the numbered reflections still (Automotive)", () => {
    render(<CaseStudyView c={AUTOMOTIVE_CASE} resolveAsset={resolveAsset} onNavigate={() => undefined} />);
    const reflections = screen.getByRole("region", { name: AUTOMOTIVE_CASE.reflections?.title ?? "(no reflections)" });
    expect(within(reflections).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(revealsAround(reflections)).toEqual([]);
  });
});
