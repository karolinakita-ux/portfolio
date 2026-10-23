import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { FAQ } from "#features/about/about.content.ts";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { WORK_CASES } from "#features/work/work.content.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import type * as Analytics from "#shared/lib/analytics/analytics.utils.ts";
import { track, trackPageview } from "#shared/lib/analytics/analytics.utils.ts";
import { describeClick } from "#shared/lib/analytics/clicks.utils.ts";
import { SECTION } from "#shared/lib/routes/routes.constants.ts";

/**
 * Which visits and clicks the app counts (src/shared/lib/analytics/analytics.utils.ts): the helpers are mocked,
 * so these tests check what the app reports and when; the helpers' own tests check what goes to Umami.
 */
vi.mock("#shared/lib/analytics/analytics.utils.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof Analytics>()),
  track: vi.fn(),
  trackPageview: vi.fn(),
}));
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const renderApp = (url = "/") => {
  window.history.replaceState(null, "", url);
  const user = userEvent.setup();
  render(<App />);
  return { user };
};

/** Clicks a link without following it: jsdom cannot open other documents (mail app, new tabs). */
const clickLink = (link: HTMLElement) => {
  link.addEventListener("click", (event) => event.preventDefault(), { once: true });
  fireEvent.click(link);
};

const events = () => vi.mocked(track).mock.calls;
const pageviews = () => vi.mocked(trackPageview).mock.calls.length;

beforeEach(() => {
  vi.mocked(track).mockClear();
  vi.mocked(trackPageview).mockClear();
});

describe("pageviews", () => {
  it("counts the first page once, after its title is set", () => {
    const titles: string[] = [];
    vi.mocked(trackPageview).mockImplementationOnce(() => titles.push(document.title));
    renderApp("/about#career");
    expect(titles).toEqual(["About - Karolina Kita"]);
  });

  it("counts every view change, Back included, but not a jump within the page", async () => {
    const { user } = renderApp("/");
    expect(pageviews()).toBe(1);

    await user.click(screen.getByRole("link", { name: "Explore Case Studies" }));
    expect(pageviews()).toBe(1);

    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    await user.click(primary.getByRole("link", { name: "About" }));
    expect(pageviews()).toBe(2);

    act(() => {
      window.history.replaceState({ kbView: "work", scrollY: 0 }, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { kbView: "work", scrollY: 0 } }));
    });
    expect(pageviews()).toBe(3);
  });

  it("does not count copying a section link (the hash changes, the page does not)", async () => {
    const { user } = renderApp("/about");
    await user.click(screen.getByRole("link", { name: "Copy link to section: " + FAQ.title }));
    expect(window.location.hash).toBe("#faq");
    expect(pageviews()).toBe(1);
    expect(events()).toEqual([[EVENT.sectionLinkCopy, { section: "faq" }]]);
  });
});

describe("events on the Work page", () => {
  it("counts opening a case study from its link and from its thumbnail", async () => {
    const { user } = renderApp("/");
    const [first] = WORK_CASES;
    if (!first) throw new Error("no case cards");
    await user.click(within(screen.getByRole("article", { name: first.title })).getByRole("link", { name: first.cta }));
    expect(events()).toEqual([[EVENT.caseOpen, { case: first.view, from: "card-link" }]]);

    await user.click(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Work" }));
    vi.mocked(track).mockClear();
    const thumbnail = document.querySelector<HTMLAnchorElement>('a[data-case-thumbnail-link][href="/work/automotive"]');
    if (!thumbnail) throw new Error("no Automotive thumbnail link");
    await user.click(thumbnail);
    expect(events()).toEqual([[EVENT.caseOpen, { case: "case-automotive", from: "thumbnail" }]]);
  });

  it("counts the Figma and GitHub links in the hero and in the banner", () => {
    renderApp("/");
    clickLink(screen.getByRole("link", { name: /^Inspect Figma Workspace/ }));
    clickLink(screen.getByRole("link", { name: /^View Code on GitHub/ }));
    clickLink(screen.getByRole("link", { name: /^Explore the Figma Workspace/ }));
    clickLink(screen.getByRole("link", { name: /^Explore the Code on GitHub/ }));
    expect(events()).toEqual([
      [EVENT.figmaClick, { place: "hero" }],
      [EVENT.githubClick, { place: "hero" }],
      [EVENT.figmaClick, { place: "banner" }],
      [EVENT.githubClick, { place: "banner" }],
    ]);
  });

  it("counts each kind of LinkedIn link in the recommendations", () => {
    renderApp("/");
    const section = within(screen.getByRole("region", { name: "Trusted by the leaders I worked for" }));
    clickLink(section.getByRole("link", { name: /^Stewart Wilson, LinkedIn profile/ }));
    clickLink(section.getByRole("link", { name: /^Precisely, company page on LinkedIn/ }));
    clickLink(section.getByRole("link", { name: /^Read the full recommendations on LinkedIn/ }));
    expect(events()).toEqual([
      [EVENT.linkedinClick, { target: "author", place: "testimonials" }],
      [EVENT.linkedinClick, { target: "company", place: "testimonials" }],
      [EVENT.linkedinClick, { target: "recommendations", place: "testimonials" }],
    ]);
  });

  it("counts a theme switch, but not picking the theme already shown", async () => {
    const { user } = renderApp("/");
    await user.click(screen.getByRole("button", { name: "Dark theme" }));
    await user.click(screen.getByRole("button", { name: "Dark theme" }));
    await user.click(screen.getByRole("button", { name: "Light theme" }));
    expect(events()).toEqual([
      [EVENT.themeSwitch, { theme: "dark" }],
      [EVENT.themeSwitch, { theme: "light" }],
    ]);
  });
});

describe("events in the footer and on the Contact page", () => {
  it("counts the footer's LinkedIn and email links, and links to the privacy page", async () => {
    const { user } = renderApp("/");
    const footer = within(screen.getByRole("contentinfo"));
    clickLink(footer.getByRole("link", { name: /LinkedIn/ }));
    clickLink(footer.getByRole("link", { name: /opens your email app/ }));
    fireEvent.click(footer.getByRole("button", { name: "Copy email address" }));
    expect(events()).toEqual([
      [EVENT.linkedinClick, { target: "profile", place: "footer" }],
      [EVENT.emailClick, { action: "mailto", place: "footer" }],
      [EVENT.emailClick, { action: "copy", place: "footer" }],
    ]);

    await user.click(footer.getByRole("link", { name: "Privacy" }));
    expect(window.location.pathname).toBe("/privacy");
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeInTheDocument();
  });

  it("counts the Contact page's LinkedIn and email links", () => {
    renderApp("/contact");
    const channels = within(screen.getByRole("region", { name: "Primary Channels" }));
    clickLink(channels.getByRole("link", { name: /LinkedIn/ }));
    clickLink(channels.getByRole("link", { name: /opens your email app/ }));
    fireEvent.click(channels.getByRole("button", { name: "Copy email address" }));
    expect(events()).toEqual([
      [EVENT.linkedinClick, { target: "profile", place: "contact" }],
      [EVENT.emailClick, { action: "mailto", place: "contact" }],
      [EVENT.emailClick, { action: "copy", place: "contact" }],
    ]);
  });
});

describe("events on case studies", () => {
  it("counts opening a screenshot and moving to the next case study", async () => {
    const { user } = renderApp("/work/automotive");
    const [firstScreenshot] = screen.getAllByRole("button", { name: /View full size/ });
    if (!firstScreenshot) throw new Error("no screenshots rendered");
    await user.click(firstScreenshot);
    await user.keyboard("{ArrowRight}"); // browsing inside the viewer is not a new open
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close image viewer" }));

    const nav = within(screen.getByRole("navigation", { name: "Case study navigation" }));
    await user.click(nav.getByRole("link", { name: /Next Case Study/ }));

    expect(events()).toEqual([
      [EVENT.imageOpen, { case: "case-automotive", image: caseCards(AUTOMOTIVE_CASE)[0]?.id }],
      [EVENT.caseNav, { from: "case-automotive", to: "case-meetestim", direction: "next" }],
    ]);
  });
});

describe("events on the About page", () => {
  it("counts a FAQ question when it opens, not when it closes", async () => {
    const { user } = renderApp("/about");
    const [first] = FAQ.items;
    if (!first) throw new Error("no FAQ items");
    const question = screen.getByRole("button", { name: first.question });
    await user.click(question);
    await user.click(question);
    expect(events()).toEqual([[EVENT.faqOpen, { question: first.id }]]);
  });
});

describe("dead clicks", () => {
  it("are described from the page's own markup: the hero, section ids and card titles", () => {
    renderApp("/");
    const [first] = WORK_CASES;
    if (!first) throw new Error("no case cards");
    const card = within(screen.getByRole("article", { name: first.title }));
    expect(describeClick(screen.getByRole("heading", { level: 1 }))).toMatchObject({
      element: "heading",
      area: "hero",
    });
    expect(describeClick(card.getByText(first.summary))).toEqual({
      element: "text",
      area: SECTION.workCases,
      label: first.title,
    });
    expect(describeClick(card.getByRole("heading", { name: first.title }))).toEqual({
      element: "heading",
      area: SECTION.workCases,
      label: first.title,
    });
  });
});
