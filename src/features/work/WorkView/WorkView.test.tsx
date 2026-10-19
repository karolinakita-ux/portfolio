import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TESTIMONIALS, WORK_CASES } from "#features/work/work.content.ts";
import { REVEAL } from "#test/reveal.ts";

import { WorkView } from "./WorkView.tsx";

const renderWork = () => render(<WorkView resolveAsset={(name) => "/assets/" + name} onNavigate={() => undefined} />);

describe("WorkView", () => {
  it("links the source code next to the Figma workspace, in a new tab", () => {
    renderWork();
    const link = screen.getByRole("link", { name: /^View Code on GitHub.*opens in a new tab/ });
    expect(link).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the component library (Storybook on the live site) after the code, in a new tab", () => {
    renderWork();
    const link = screen.getByRole("link", { name: /^View Components in Storybook.*opens in a new tab/ });
    expect(link).toHaveAttribute("href", "https://karolina.kita.company/storybook/");
    expect(link).toHaveAttribute("target", "_blank");
    const hero = screen.getByRole("link", { name: /^View Code on GitHub/ }).parentElement;
    expect(link.parentElement).toBe(hero);
  });

  it("links the Figma workspace and the code from the Behind the Design banner", () => {
    renderWork();
    const figma = screen.getByRole("link", { name: /^Explore the Figma Workspace.*opens in a new tab/ });
    expect(figma).toHaveAttribute("href", expect.stringContaining("figma.com"));
    const code = screen.getByRole("link", { name: /^Explore the Code on GitHub.*opens in a new tab/ });
    expect(code).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");
    expect(code).toHaveAttribute("target", "_blank");
  });
});

describe("WorkView scroll reveal", () => {
  it("fades up each case card and each testimonial, and nothing else", () => {
    renderWork();
    const cases = WORK_CASES.map((item) => screen.getByRole("article", { name: item.title }));
    const testimonials = within(
      screen.getByRole("region", { name: "Trusted by the leaders I worked for" }),
    ).getAllByRole("figure");
    expect(testimonials).toHaveLength(TESTIMONIALS.length);
    for (const card of [...cases, ...testimonials]) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual([...cases, ...testimonials]);
  });

  it("keeps the hero, the headings and the callouts still", () => {
    renderWork();
    const still = [
      screen.getByRole("region", { name: "Clarity for complex enterprise software" }),
      screen.getByRole("heading", { level: 1 }),
      screen.getByRole("heading", { level: 2, name: "Selected Work & Case Studies" }),
      screen.getByRole("complementary", { name: "Confidentiality note" }),
      screen.getByRole("complementary", { name: "How this portfolio was built" }),
    ];
    for (const element of still) {
      expect(element).not.toHaveClass(REVEAL);
      expect(element.closest(`.${REVEAL}`)).toBeNull();
      expect(element.querySelector(`.${REVEAL}`)).toBeNull();
    }
  });
});
