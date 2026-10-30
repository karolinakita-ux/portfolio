import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { UMAMI } from "#shared/lib/analytics/analytics.constants.ts";
import { initStatistics } from "#shared/lib/analytics/statistics-consent.utils.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";

import { App } from "./App.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

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

  it("offers the case studies from the hero, the Figma workspace and the code from the banner, and credits the tools in the footer", async () => {
    const { user } = renderApp();

    const banner = within(screen.getByRole("complementary", { name: "How this portfolio was built" }));
    const figma = banner.getByRole("link", { name: /^Explore the Figma Workspace.*opens in a new tab/ });
    expect(figma).toHaveAttribute("href", expect.stringContaining("figma.com"));
    expect(figma).toHaveAttribute("target", "_blank");
    const code = banner.getByRole("link", { name: /^Explore the Code on GitHub.*opens in a new tab/ });
    expect(code).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio");

    const hero = screen.getByRole("heading", { level: 1 });
    await user.click(screen.getByRole("link", { name: "Explore Case Studies" }));
    expect(screen.getByRole("heading", { name: "Selected Work & Case Studies" })).toHaveFocus();
    expect(window.location.pathname + window.location.hash).toBe("/#enterprise-cases");
    // A jump within the page only scrolls: the view is not re-rendered (no fade, no flicker).
    expect(screen.getByRole("heading", { level: 1 })).toBe(hero);

    expect(
      within(screen.getByRole("contentinfo")).getByText(/prototyped & built with Claude AI assistance/),
    ).toBeInTheDocument();
  });

  it("shows the version from package.json in the footer, linked to the release notes", () => {
    renderApp();
    const { version } = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { version: string };
    const link = within(screen.getByRole("contentinfo")).getByRole("link", { name: /^Version \d.*release notes/ });
    expect(link).toHaveTextContent(`Version ${version} release notes (opens in a new tab)`);
    expect(link).toHaveAttribute("href", "https://github.com/karolinakita-ux/portfolio/blob/main/CHANGELOG.md");
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
    ["/resume", "Karolina Kita"], // the CV's old name
    ["/work/data-governance", "White-Label Theme Generator"],
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
    expect(thumbnailLinks).toHaveLength(4);
    for (const link of thumbnailLinks) {
      expect(link).toHaveAttribute("tabindex", "-1");
      expect(link).toHaveAttribute("aria-hidden", "true");
    }
    // Readers that ignore ARIA (search engines, text extractors) still get a named link: the card title.
    expect([...thumbnailLinks].map((link) => link.textContent)).toEqual([
      "Smart Ticket: Mobile Ticketing & Transit Operations",
      "Automotive B2B Marketplace Redesign",
      "Project Planning & Cost Management Platform",
      "Enterprise White-Label Theme Generator",
    ]);
    // The image stays readable: the overlay sits beside it, not around it.
    const thumbnail = screen.getByRole("img", { name: /^The same data table in a read-only base theme/ });
    expect(thumbnail.closest("a")).toBeNull();
    // Only the CTA reaches the Data Governance case from the keyboard / accessibility tree.
    const casePath = "/work/data-governance";
    expect(screen.getAllByRole("link").filter((link) => link.getAttribute("href") === casePath)).toHaveLength(1);

    const caseLink = [...thumbnailLinks].find((link) => link.getAttribute("href") === casePath);
    await user.click(caseLink!);
    expect(h1()).toHaveTextContent("White-Label Theme Generator");
    expect(window.location.pathname).toBe(casePath);
  });

  it("walks the case studies from the Work page", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "View Discovery Case" }));
    expect(h1()).toHaveTextContent(
      "Automotive B2B Ecosystem: From Dealer Research Across Europe to a Validated Redesign",
    );
    // Work is the current section; only the breadcrumb marks the case study as the current page.
    expect(within(primaryNav()).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByRole("link", { name: /^Next Case Study.*Enterprise Project Planning/ }));
    expect(h1()).toHaveTextContent("Enterprise Project Planning & Cost Management Platform");

    await user.click(
      within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Work" }),
    );
    expect(h1()).toHaveTextContent("Clarity for complex enterprise software");
  });

  it("orders the header as it looks on desktop: logo, primary nav, then the theme switch", () => {
    renderApp();
    const header = screen.getByRole("banner");
    const logo = within(header).getByRole("link", { name: "K.Kita - Karolina Kita, home page" });
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
    expect(within(dialog).getByRole("heading", { name: "Multi-Market Data Synthesis" })).toBeInTheDocument();
    expect(within(dialog).getByText(/^1 \/ \d+$/)).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("heading", { name: "1:1 Interviews in Polish" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(dialog).not.toHaveAttribute("open");
    expect(firstScreenshot).toHaveFocus();
  });

  it("loads a case study's screenshots only once the visitor points at or focuses a link to it", async () => {
    vi.mocked(preloadImages).mockClear();
    const { user } = renderApp("/");
    const shots = (c: Parameters<typeof caseCards>[0]) => caseCards(c).map((card) => "/assets/" + card.asset);
    const cardLink = (title: string) =>
      within(screen.getByRole("article", { name: title })).getByRole("link", { name: /^View/ });
    // Nothing on page load: a visitor who only reads the Work page downloads no screenshots.
    expect(preloadImages).not.toHaveBeenCalled();

    await user.hover(cardLink("Project Planning & Cost Management Platform"));
    expect(preloadImages).toHaveBeenCalledTimes(1);
    expect(preloadImages).toHaveBeenLastCalledWith(shots(PROJECT_PLANNING_CASE));

    // Once per case: pointing at it again queues nothing new.
    await user.unhover(cardLink("Project Planning & Cost Management Platform"));
    await user.hover(cardLink("Project Planning & Cost Management Platform"));
    expect(preloadImages).toHaveBeenCalledTimes(1);

    // Keyboard focus counts as interest too.
    cardLink("Automotive B2B Marketplace Redesign").focus();
    expect(preloadImages).toHaveBeenLastCalledWith(shots(AUTOMOTIVE_CASE));
    expect(preloadImages).not.toHaveBeenCalledWith(shots(DATA_GOVERNANCE_CASE));
  });

  it("expands FAQ answers on the About page", async () => {
    const { user } = renderApp("/about");
    const question = screen.getByRole("button", { name: /How does a background in psychology/ });
    expect(question).toHaveAttribute("aria-expanded", "false");

    await user.click(question);

    expect(question).toHaveAttribute("aria-expanded", "true");
  });

  it("moves focus to the content when the consent box goes away with focus in it", async () => {
    initStatistics({ production: true, base: "/", hostname: UMAMI.host, privacy: {} });
    try {
      const { user } = renderApp("/about");
      screen.getByRole("button", { name: PRIVACY.consent.decline }).focus();
      await user.keyboard("{Enter}");
      expect(screen.queryByRole("region", { name: PRIVACY.consent.title })).not.toBeInTheDocument();
      expect(screen.getByRole("main")).toHaveFocus();
    } finally {
      initStatistics({ production: false, base: "/", hostname: "localhost", privacy: {} });
    }
  });
});
