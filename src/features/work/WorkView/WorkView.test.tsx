import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TESTIMONIALS, WORK_CASES } from "#features/work/work.content.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { REVEAL } from "#test/reveal.ts";

import { WorkView } from "./WorkView.tsx";

const renderWork = () => render(<WorkView resolveAsset={(name) => "/assets/" + name} onNavigate={() => undefined} />);

const hero = () => within(screen.getByRole("region", { name: "Clarity for Complex Enterprise Software" }));
const banner = () => within(screen.getByRole("complementary", { name: "How this portfolio was built" }));

/** The Figma workspace, the source code and the component library (Storybook on the live site). */
const TOOLS = /figma\.com|github\.com\/karolinakita-ux\/portfolio|\/storybook\//;

describe("WorkView", () => {
  it("offers exactly two actions in the hero: the case studies, then the CV beside them", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<WorkView resolveAsset={(name) => "/assets/" + name} onNavigate={onNavigate} />);
    const links = hero().getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["Explore Case Studies", "View CV"]);
    const [cases, cv] = links;
    expect(cases).toHaveAttribute("href", "/#enterprise-cases");
    expect(cv).toHaveAttribute("href", "/cv");
    expect(cv).not.toHaveAttribute("target");
    expect(cv?.parentElement).toBe(cases?.parentElement);

    if (!cv) throw new Error("no View CV link");
    await user.click(cv);
    expect(onNavigate).toHaveBeenCalledWith(VIEW.cv);
  });

  it("links the Figma workspace, the code and the component library from the Behind the Design banner only", () => {
    renderWork();
    const figma = banner().getByRole("link", { name: /^Explore the Figma Workspace.*opens in a new tab/ });
    expect(figma).toHaveAttribute("href", expect.stringContaining("figma.com"));
    const code = banner().getByRole("link", { name: /^Explore the Code on GitHub.*opens in a new tab/ });
    expect(code).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");
    const components = banner().getByRole("link", { name: /^Explore the Storybook Library.*opens in a new tab/ });
    expect(components).toHaveAttribute("href", "https://karolina.kita.company/storybook/");
    expect(components.previousElementSibling).toBe(code);
    for (const link of [figma, code, components]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }

    const everywhere = screen.getAllByRole("link").filter((link) => TOOLS.test(link.getAttribute("href") ?? ""));
    expect(everywhere).toEqual([figma, code, components]);
  });
});

describe("WorkView scroll reveal", () => {
  it("fades up each case card and each testimonial, and nothing else", () => {
    renderWork();
    const cases = WORK_CASES.map((item) => screen.getByRole("article", { name: item.title }));
    const testimonials = within(
      screen.getByRole("region", { name: "Trusted by the Leaders I Worked For" }),
    ).getAllByRole("figure");
    expect(testimonials).toHaveLength(TESTIMONIALS.length);
    for (const card of [...cases, ...testimonials]) expect(card).toHaveClass(REVEAL);
    expect(Array.from(document.querySelectorAll(`.${REVEAL}`))).toEqual([...cases, ...testimonials]);
  });

  it("keeps the hero, the headings and the callouts still", () => {
    renderWork();
    const still = [
      screen.getByRole("region", { name: "Clarity for Complex Enterprise Software" }),
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
