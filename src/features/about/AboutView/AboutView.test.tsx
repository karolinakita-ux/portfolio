import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ABOUT_ACTIONS, FAQ, MILESTONES, PRINCIPLES } from "#features/about/about.content.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { REVEAL } from "#test/reveal.ts";

import { AboutView } from "./AboutView.tsx";

const renderAbout = () => render(<AboutView portraitSrc="/assets/site/portrait.webp" onNavigate={() => undefined} />);

describe("AboutView hero", () => {
  it("offers the CV beside the case studies, the primary button last", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<AboutView portraitSrc="/assets/site/portrait.webp" onNavigate={onNavigate} />);
    const hero = within(screen.getByRole("region", { name: "Designing Clarity for Complex Software" }));
    const cv = hero.getByRole("link", { name: ABOUT_ACTIONS.cv });
    const work = hero.getByRole("link", { name: ABOUT_ACTIONS.work });
    expect(cv).toHaveAttribute("href", "/cv");
    expect(cv.parentElement).toBe(work.parentElement);
    expect(cv.compareDocumentPosition(work) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.click(cv);
    expect(onNavigate).toHaveBeenCalledWith(VIEW.cv);
  });

  it("names both buttons to the case studies alike, the hero's and the career section's: one destination, one label", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<AboutView portraitSrc="/assets/site/portrait.webp" onNavigate={onNavigate} />);
    const links = screen.getAllByRole("link", { name: ABOUT_ACTIONS.work });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/#" + SECTION.workCases);
    const career = within(screen.getByRole("region", { name: "Career Progression" }));
    await user.click(career.getByRole("link", { name: ABOUT_ACTIONS.work }));
    expect(onNavigate).toHaveBeenCalledWith(VIEW.work, SECTION.workCases);
  });
});

describe("AboutView scroll reveal", () => {
  it("fades up each principle card and each career milestone, and nothing else", () => {
    renderAbout();
    const principles = within(screen.getByRole("region", { name: "How I Like to Work" })).getAllByRole("listitem");
    expect(principles.map((card) => within(card).getByRole("heading").textContent)).toEqual(
      PRINCIPLES.map((principle) => principle.title),
    );
    // Newest first, as the page lists them.
    const milestones = [...MILESTONES]
      .reverse()
      .map((milestone) => screen.getByRole("article", { name: milestone.title }));
    for (const card of [...principles, ...milestones]) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual([...principles, ...milestones]);
  });

  it("keeps the hero, the headings, the portrait and the FAQ still", () => {
    renderAbout();
    const still = [
      screen.getByRole("region", { name: "Designing Clarity for Complex Software" }),
      screen.getByRole("heading", { level: 1 }),
      screen.getByRole("heading", { level: 2, name: "How I Like to Work" }),
      screen.getByRole("heading", { level: 2, name: "Career Progression" }),
      screen.getByRole("figure"),
      screen.getByRole("region", { name: FAQ.title }),
    ];
    for (const element of still) {
      expect(element).not.toHaveClass(REVEAL);
      expect(element.closest(`.${REVEAL}`)).toBeNull();
      expect(element.querySelector(`.${REVEAL}`)).toBeNull();
    }
  });
});
