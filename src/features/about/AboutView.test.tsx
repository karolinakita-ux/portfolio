import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FAQ, MILESTONES, PRINCIPLES } from "./about.content.ts";
import { AboutView } from "./AboutView.tsx";

/** The scroll reveal utility (app.css): card lists only. */
const REVEAL = "reveal-on-scroll";

const renderAbout = () => render(<AboutView portraitSrc="/assets/site/portrait.webp" onNavigate={() => undefined} />);

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
      screen.getByRole("region", { name: "Designing clarity for complex software" }),
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
