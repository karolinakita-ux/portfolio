import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { mockAnimate, setMotionTokens } from "#test/animations.ts";

import { SiteHeader } from "./SiteHeader.tsx";

function Header({ view = VIEW.work, theme = "light" }: { view?: View; theme?: Theme }) {
  return <SiteHeader activeView={view} onNavigate={vi.fn()} onHome={vi.fn()} theme={theme} onThemeChange={vi.fn()} />;
}

const navLinks = () => within(screen.getByRole("navigation", { name: "Primary" })).getAllByRole("link");
const themeGroup = () => screen.getByRole("group", { name: "Colour theme" });
const pillsIn = (element: HTMLElement) => [...element.querySelectorAll<HTMLElement>("[data-pill]")];
/** The one pill inside an item; fails when there is none or more than one. */
const pillOf = (element: HTMLElement) => {
  const pills = pillsIn(element);
  expect(pills).toHaveLength(1);
  return pills[0]!;
};
/** The underline bar inside an item's pill, if there is one. */
const underlineOf = (element: HTMLElement) => element.querySelector<HTMLElement>("[data-pill-underline]");
/** data-pill of every visible pill in the element. */
const visiblePills = (element: HTMLElement) =>
  pillsIn(element)
    .filter((pill) => pill.classList.contains("opacity-100"))
    .map((pill) => pill.dataset.pill);

describe("SiteHeader nav pill", () => {
  it("gives every nav link one hidden-from-AT pill behind its label, visible only on the active link", () => {
    render(<Header view={VIEW.about} />);
    const links = navLinks();
    expect(links.map((link) => link.textContent)).toEqual(["Work", "About", "Contact"]);
    for (const link of links) {
      const pill = pillOf(link);
      expect(pill).toHaveAttribute("aria-hidden", "true");
      expect(pill).toHaveClass("absolute", "inset-0", "-z-10", "pointer-events-none", "border-transparent");
      expect(pill).toHaveClass("transition-none"); // the hook animates it, never a CSS transition
      expect(pill).toHaveClass("text-text-on-accent"); // its own colour: WebKit copies the label's colour transition
    }
    expect(links.map((link) => pillOf(link).dataset.pill)).toEqual([VIEW.work, VIEW.about, VIEW.contact]);
    expect(visiblePills(screen.getByRole("navigation", { name: "Primary" }))).toEqual([VIEW.about]);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).toHaveClass("text-text-on-accent");
    expect(screen.getByRole("link", { name: "Work" })).toHaveClass("text-text-primary");
  });

  it("marks Work on a case study, with aria-current true (the breadcrumb names the page)", () => {
    render(<Header view={VIEW.caseProjectPlanning} />);
    const work = screen.getByRole("link", { name: "Work" });
    expect(work).toHaveAttribute("aria-current", "true");
    expect(pillOf(work)).toHaveClass("opacity-100");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("underlines the current page inside its pill, so the underline rides with it (pill alone: 1.54:1 on white, WCAG 1.4.11)", () => {
    /** The labels whose underline shows: the bar inside the one visible pill. */
    const underlined = () =>
      navLinks()
        .filter((link) => pillOf(link).classList.contains("opacity-100"))
        .filter((link) => underlineOf(link) !== null)
        .map((link) => link.textContent);
    const { rerender } = render(<Header view={VIEW.about} />);
    expect(underlined()).toEqual(["About"]);
    for (const link of navLinks()) {
      // Every pill has the bar, so it fades out with the pill too; a hidden pill hides it.
      const underline = underlineOf(link);
      expect(underline?.parentElement).toBe(pillOf(link)); // hidden from assistive tech with it
      expect(underline).toBeEmptyDOMElement();
      // A border in the pill's own colour, not a background: forced colours drop backgrounds.
      expect(underline).toHaveClass("absolute", "inset-x-sm", "bottom-xs", "border-b-2", "border-current");
      // No text underline any more: one that stays on the link could not travel.
      expect([...link.classList].filter((name) => /^(underline|decoration-|underline-offset-)/.test(name))).toEqual([]);
    }
    expect(pillOf(screen.getByRole("link", { name: "Work" }))).toHaveClass("opacity-0");

    rerender(<Header view={VIEW.caseProjectPlanning} />); // a case study: Work, with aria-current="true"
    expect(underlined()).toEqual(["Work"]);

    rerender(<Header view={VIEW.privacy} />); // out of the nav: no pill, no underline
    expect(underlined()).toEqual([]);
  });

  it("shows no pill on a page outside the nav (Privacy)", () => {
    render(<Header view={VIEW.privacy} />);
    expect(visiblePills(screen.getByRole("navigation", { name: "Primary" }))).toEqual([]);
    for (const link of navLinks()) expect(link).not.toHaveAttribute("aria-current");
  });

  it("slides the pill whenever the view changes, however the visitor navigated", () => {
    setMotionTokens();
    const { animations } = mockAnimate();
    const { rerender } = render(<Header view={VIEW.work} />);
    rerender(<Header view={VIEW.contact} />); // e.g. a footer link or Back
    expect(animations).toHaveLength(1);
    expect(animations[0]?.target).toBe(pillOf(screen.getByRole("link", { name: "Contact" })));
    // The underline is inside the moving pill, so it travels with it.
    expect(underlineOf(screen.getByRole("link", { name: "Contact" }))?.parentElement).toBe(animations[0]?.target);

    rerender(<Header view={VIEW.caseDataGovernance} />); // a case study: Work
    expect(animations[1]?.target).toBe(pillOf(screen.getByRole("link", { name: "Work" })));

    rerender(<Header view={VIEW.privacy} />); // out of the nav: the Work pill fades out
    expect(animations[2]?.target).toBe(pillOf(screen.getByRole("link", { name: "Work" })));
    expect(animations[2]?.keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
  });
});

describe("SiteHeader theme switch pill", () => {
  it("gives each theme button a pill, visible on the pressed one", () => {
    render(<Header theme="dark" />);
    const light = screen.getByRole("button", { name: "Light mode" });
    const dark = screen.getByRole("button", { name: "Dark mode" });
    expect(pillOf(light)).toHaveAttribute("data-pill", "light");
    expect(pillOf(dark)).toHaveAttribute("data-pill", "dark");
    expect(pillOf(light)).toHaveAttribute("aria-hidden", "true");
    expect(dark).toHaveAttribute("aria-pressed", "true");
    expect(light).toHaveAttribute("aria-pressed", "false");
    // Shown by the button's aria-pressed (ThemeToggle.test.tsx), so the prerendered switch can be pressed before the app runs.
    for (const pill of pillsIn(themeGroup())) expect(pill).toHaveClass("group-aria-pressed/theme:opacity-100");
  });

  it("names the group's view-transition layer and keeps the pills above its background", () => {
    render(<Header />);
    expect(themeGroup()).toHaveClass("kb-theme-toggle", "isolate");
  });

  it("carries the class base.css uses to keep focus on its links and buttons from scrolling the page", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toHaveClass("kb-site-header");
  });

  it("slides the pill to the new theme", () => {
    setMotionTokens();
    const { animations } = mockAnimate();
    const { rerender } = render(<Header theme="light" />);
    rerender(<Header theme="dark" />);
    expect(animations).toHaveLength(1);
    expect(animations[0]?.target).toBe(pillOf(screen.getByRole("button", { name: "Dark mode" })));
  });
});
