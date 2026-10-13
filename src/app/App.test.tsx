import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/automotive.content.ts";
import { caseCards } from "#features/case-studies/gallery.utils.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/project-planning.content.tsx";
import { THEMING_CASE } from "#features/case-studies/theming.content.tsx";
import { preloadImages } from "#shared/media/image-preload.ts";

import { App } from "./App.tsx";

vi.mock("#shared/media/image-preload.ts", () => ({ preloadImages: vi.fn() }));

const renderApp = (url = "/") => {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  render(<App />);
  return { user };
};

const h1 = () => screen.getByRole("heading", { level: 1 });
const primaryNav = () => screen.getByRole("navigation", { name: "Primary" });

describe("App", () => {
  it("opens on Work", () => {
    renderApp();
    expect(h1()).toHaveTextContent("Clarity for complex enterprise software");
    expect(document.title).toBe("Karolina Kita - Senior Product Designer");
    expect(within(primaryNav()).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  });

  it("offers the case studies and the Figma workspace from the hero, and credits the tools in the footer", async () => {
    const { user } = renderApp();

    const figma = screen.getByRole("link", { name: /^Inspect Figma Workspace.*opens in a new tab/ });
    expect(figma).toHaveAttribute("href", expect.stringContaining("figma.com"));
    expect(figma).toHaveAttribute("target", "_blank");

    await user.click(screen.getByRole("link", { name: "Explore Case Studies" }));
    expect(screen.getByRole("heading", { name: "Selected Work & Case Studies" })).toHaveFocus();
    expect(window.location.pathname + window.location.hash).toBe("/#enterprise-cases");

    expect(
      within(screen.getByRole("contentinfo")).getByText(/prototyped & built with Claude AI assistance/),
    ).toBeInTheDocument();
  });

  it("links each recommendation to its author and company on LinkedIn, and to the full recommendations", () => {
    renderApp();
    const section = within(screen.getByRole("region", { name: "Trusted by the leaders I worked for" }));
    const expectNewTab = (name: RegExp, href: string) => {
      const link = section.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    };

    expectNewTab(
      /^Stewart Wilson, LinkedIn profile \(opens in a new tab\)$/,
      "https://www.linkedin.com/in/stewart-wilson-ba92112a/",
    );
    expectNewTab(
      /^Precisely, company page on LinkedIn \(opens in a new tab\)$/,
      "https://www.linkedin.com/company/preciselydata/",
    );
    expectNewTab(/^Gavin Harvey, LinkedIn profile \(opens in a new tab\)$/, "https://www.linkedin.com/in/harveygavin/");
    expectNewTab(
      /^Cox Automotive, company page on LinkedIn \(opens in a new tab\)$/,
      "https://www.linkedin.com/company/coxautomotiveeurope/",
    );
    // jsdom's name computation drops the space before the sr-only suffix inside Button; browsers keep it.
    expectNewTab(
      /^Read the full recommendations on LinkedIn ?\(opens in a new tab\)$/,
      "https://www.linkedin.com/in/karolinakita/details/recommendations",
    );
    // Seen as "Role | Company"; the bar is hidden from screen readers, which hear "Role at Company".
    const roleLine = section.getByText(/^UX Director/);
    expect(roleLine).toHaveTextContent("UX Director | at Precisely");
    expect(within(roleLine).getByText("|")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["/about", "Designing clarity for complex software"],
    ["/contact", "Let’s connect"],
    ["/cv", "Karolina Kita"],
    ["/work/data-governance", "Multi-Tenant Theme Customizer"],
    ["/#about", "Designing clarity for complex software"], // old hash link (before 3.0.0)
  ])("deep-links %s", (url, heading) => {
    renderApp(url);
    expect(h1()).toHaveTextContent(heading);
  });

  it("lands on a section from a deep link and gives each section a copyable link", async () => {
    renderApp("/about#career");
    const heading = screen.getByRole("heading", { level: 2, name: "Career Progression" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByRole("link", { name: "Copy link to section: Career Progression" })).toHaveAttribute(
      "href",
      "#career",
    );
  });

  it("navigates with the primary nav and updates URL, title and active pill", async () => {
    const { user } = renderApp();

    await user.click(within(primaryNav()).getByRole("link", { name: "About" }));

    expect(h1()).toHaveTextContent("Designing clarity for complex software");
    expect(window.location.pathname).toBe("/about");
    expect(document.title).toBe("About - Karolina Kita");
    expect(within(primaryNav()).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });

  it("opens a case study from its thumbnail, without an extra Tab stop or screen reader link", async () => {
    const { user } = renderApp();
    const thumbnailLinks = document.querySelectorAll<HTMLAnchorElement>("a[data-case-thumbnail-link]");
    expect(thumbnailLinks).toHaveLength(3);
    for (const link of thumbnailLinks) {
      expect(link).toHaveAttribute("tabindex", "-1");
      expect(link).toHaveAttribute("aria-hidden", "true");
    }
    // The image stays readable: the overlay sits beside it, not around it.
    const thumbnail = screen.getByRole("img", { name: /^Three Edit Theme panels/ });
    expect(thumbnail.closest("a")).toBeNull();
    // Only the CTA reaches the theming case from the keyboard / accessibility tree.
    const themingPath = "/work/data-governance";
    expect(screen.getAllByRole("link").filter((link) => link.getAttribute("href") === themingPath)).toHaveLength(1);

    const themingLink = [...thumbnailLinks].find((link) => link.getAttribute("href") === themingPath);
    await user.click(themingLink!);
    expect(h1()).toHaveTextContent("Multi-Tenant Theme Customizer");
    expect(window.location.pathname).toBe(themingPath);
  });

  it("walks the case studies from the Work page", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "View Discovery Case" }));
    expect(h1()).toHaveTextContent("Automotive B2B Marketplace: Research-Backed Redesign");
    // Work is the current section; only the breadcrumb marks the case study as the current page.
    expect(within(primaryNav()).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByRole("link", { name: /Next Case Study: Project Planning/ }));
    expect(h1()).toHaveTextContent("Project Planning");

    await user.click(
      within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Work" }),
    );
    expect(h1()).toHaveTextContent("Clarity for complex enterprise software");
  });

  it("orders the header as it looks on desktop: logo, primary nav, then the theme switch", () => {
    renderApp();
    const header = screen.getByRole("banner");
    const logo = within(header).getByRole("link", { name: "Karolina Kita, home page" });
    const nav = within(header).getByRole("navigation", { name: "Primary" });
    const themeSwitch = within(header).getByRole("group", { name: "Color theme" });

    expect(logo.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(nav.compareDocumentPosition(themeSwitch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("switches and remembers the theme", async () => {
    const { user } = renderApp();
    const dark = screen.getByRole("button", { name: "Dark theme" });

    await user.click(dark);

    expect(dark).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("kb-theme")).toBe("dark");
  });

  it("opens screenshots in the image viewer and browses with the arrow keys", async () => {
    const { user } = renderApp("/work/automotive");
    const [firstScreenshot] = screen.getAllByRole("button", { name: /View full size/ });
    if (!firstScreenshot) throw new Error("no screenshots rendered");

    await user.click(firstScreenshot);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Multi-Market Survey Analysis" })).toBeInTheDocument();
    expect(within(dialog).getByText(/^1 \/ \d+$/)).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("heading", { name: "1-on-1 Customer Interviews" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(dialog).not.toHaveAttribute("open");
    expect(firstScreenshot).toHaveFocus();
  });

  it("queues every case study's screenshots for background loading from any page", () => {
    renderApp("/about");
    const all = [AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, THEMING_CASE].flatMap((c) =>
      caseCards(c).map((card) => "/assets/" + card.asset),
    );
    expect(preloadImages).toHaveBeenCalledWith(all);
  });

  it("expands FAQ answers on the About page", async () => {
    const { user } = renderApp("/about");
    const question = screen.getByRole("button", { name: /How does a background in psychology/ });
    expect(question).toHaveAttribute("aria-expanded", "false");

    await user.click(question);

    expect(question).toHaveAttribute("aria-expanded", "true");
  });
});
