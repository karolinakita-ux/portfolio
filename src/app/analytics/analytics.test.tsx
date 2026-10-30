import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { FAQ } from "#features/about/about.content.ts";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";
import { WORK_CASES } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import type * as Analytics from "#shared/lib/analytics/analytics.utils.ts";
import { track, trackPageview } from "#shared/lib/analytics/analytics.utils.ts";
import { describeClick } from "#shared/lib/analytics/clicks.utils.ts";
import { SECTION, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";

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

  it("counts the Figma, GitHub and Storybook links in the hero and in the banner", () => {
    renderApp("/");
    clickLink(screen.getByRole("link", { name: /^Inspect Figma Workspace/ }));
    clickLink(screen.getByRole("link", { name: /^View Code on GitHub/ }));
    clickLink(screen.getByRole("link", { name: /^View Components in Storybook/ }));
    clickLink(screen.getByRole("link", { name: /^Explore the Figma Workspace/ }));
    clickLink(screen.getByRole("link", { name: /^Explore the Code on GitHub/ }));
    clickLink(screen.getByRole("link", { name: /^Explore the Storybook Library/ }));
    expect(events()).toEqual([
      [EVENT.figmaClick, { place: "hero" }],
      [EVENT.githubClick, { place: "hero" }],
      [EVENT.storybookClick, { place: "hero" }],
      [EVENT.figmaClick, { place: "banner" }],
      [EVENT.githubClick, { place: "banner" }],
      [EVENT.storybookClick, { place: "banner" }],
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

  it("counts a link to another website by the website it opens", () => {
    renderApp("/privacy");
    clickLink(screen.getByRole("link", { name: /^uodo\.gov\.pl/ }));
    clickLink(screen.getByRole("link", { name: /^Netlify privacy policy/ }));
    expect(events()).toEqual([
      [EVENT.outboundClick, { host: "uodo.gov.pl" }],
      [EVENT.outboundClick, { host: "www.netlify.com" }],
    ]);
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

describe("events on the privacy and accessibility pages", () => {
  it.each([
    ["/privacy", "privacy", 3],
    ["/accessibility", "accessibility", 2],
  ] as const)("counts the email links in the text of %s", (url, place, count) => {
    renderApp(url);
    const links = within(screen.getByRole("main")).getAllByRole("link", { name: PROFILE.email });
    expect(links).toHaveLength(count);
    for (const link of links) clickLink(link);
    expect(events()).toEqual(links.map(() => [EVENT.emailClick, { action: "mailto", place }]));
  });
});

/** A link that leaves the page for another website, the mail app or a file: a click on it is all Umami sees. */
const leavesThePage = (link: HTMLAnchorElement) =>
  new URL(link.href).origin !== window.location.origin ||
  link.hasAttribute("download") ||
  link.pathname.endsWith(".pdf");

describe("every way off the site", () => {
  it.each(VIEWS)("is counted on %s: one event per email, download and external link", (view) => {
    renderApp(VIEW_PATHS[view]);
    const links = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].filter(leavesThePage);
    expect(links.length).toBeGreaterThan(0);
    const uncounted = links.filter((link) => {
      vi.mocked(track).mockClear();
      clickLink(link);
      return events().length !== 1;
    });
    expect(uncounted.map((link) => link.href)).toEqual([]);
  });
});

describe("events on case studies", () => {
  it("counts opening a screenshot and moving to the next case study", async () => {
    const { user } = renderApp("/work/automotive");
    const [firstScreenshot] = screen.getAllByRole("button", { name: /View full size/ });
    if (!firstScreenshot) throw new Error("no screenshots rendered");
    await user.click(firstScreenshot);
    await user.keyboard("{ArrowRight}"); // browsing inside the viewer: not a new open, but counted as a step
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close image viewer" }));

    const nav = within(screen.getByRole("navigation", { name: "Case study navigation" }));
    await user.click(nav.getByRole("link", { name: /Next Case Study/ }));

    expect(events()).toEqual([
      [EVENT.imageOpen, { case: "case-automotive", image: caseCards(AUTOMOTIVE_CASE)[0]?.id }],
      [EVENT.imageNav, { case: "case-automotive", image: caseCards(AUTOMOTIVE_CASE)[1]?.id, direction: "next" }],
      [EVENT.caseNav, { from: "case-automotive", to: "case-project-planning", direction: "next", place: "end" }],
    ]);
  });

  it("counts the Figma file link under the details panel as the top, the design files banner's as the end", () => {
    renderApp("/work/smart-ticket");
    const [top, end] = screen.getAllByRole("link", { name: /^Open the Figma file/ });
    if (!top || !end) throw new Error("Smart Ticket has two Figma file links");
    clickLink(top);
    clickLink(end);
    expect(events()).toEqual([
      [EVENT.figmaClick, { place: "top", case: "case-smart-ticket" }],
      [EVENT.figmaClick, { place: "end", case: "case-smart-ticket" }],
    ]);
  });

  it("counts the previous / next links beside the breadcrumb as the top of the case study", async () => {
    const { user } = renderApp("/work/project-planning");
    const top = within(screen.getByRole("navigation", { name: "Previous and next case studies" }));
    await user.click(top.getByRole("link", { name: /^Previous/ }));
    expect(events()).toEqual([
      [EVENT.caseNav, { from: "case-project-planning", to: "case-automotive", direction: "prev", place: "top" }],
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

describe("events for the CV", () => {
  const h1 = () => screen.getByRole("heading", { level: 1 });

  it("counts each way to the CV page: the Work hero, the About hero and the Contact page", async () => {
    const { user } = renderApp("/");
    await user.click(screen.getByRole("link", { name: "View CV" }));
    expect(window.location.pathname).toBe("/cv");
    expect(h1()).toHaveTextContent("Karolina Kita");

    const primary = within(screen.getByRole("navigation", { name: "Primary" }));
    await user.click(primary.getByRole("link", { name: "About" }));
    await user.click(screen.getByRole("link", { name: "View CV" }));
    expect(window.location.pathname).toBe("/cv");

    await user.click(primary.getByRole("link", { name: "Contact" }));
    await user.click(screen.getByRole("link", { name: "View CV" }));
    expect(window.location.pathname).toBe("/cv");

    expect(events()).toEqual([
      [EVENT.cvOpen, { place: "hero" }],
      [EVENT.cvOpen, { place: "about" }],
      [EVENT.cvOpen, { place: "contact" }],
    ]);
  });

  it("counts a View CV link opened in a new tab too, without leaving the page", () => {
    renderApp("/");
    // After the app's own handler: stops jsdom from loading the link, which a browser opens in a new tab.
    document.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(screen.getByRole("link", { name: "View CV" }), { ctrlKey: true });
    expect(window.location.pathname).toBe("/");
    expect(events()).toEqual([[EVENT.cvOpen, { place: "hero" }]]);
  });

  it.each([
    ["/cv", "cv"],
    ["/contact", "contact"],
  ] as const)("counts the PDF download on %s", (url, place) => {
    renderApp(url);
    clickLink(screen.getByRole("link", { name: /^Download PDF \(2\spages\)$/ }));
    expect(events()).toEqual([[EVENT.cvDownload, { place }]]);
  });

  it("counts the CV's email and LinkedIn links; its portfolio link is tagged only in the PDF", () => {
    renderApp("/cv");
    const sheet = within(screen.getByRole("article", { name: "Karolina Kita" }));
    const contacts = within(sheet.getByRole("list", { name: "Contact details" }));
    clickLink(contacts.getByRole("link", { name: /^linkedin\.com\/in\/karolinakita/ }));
    clickLink(contacts.getByRole("link", { name: "karolina.kita.zg@gmail.com" }));
    const [, consentEmail] = sheet.getAllByRole("link", { name: "karolina.kita.zg@gmail.com" });
    clickLink(consentEmail!);
    expect(events()).toEqual([
      [EVENT.linkedinClick, { target: "profile", place: "cv" }],
      [EVENT.emailClick, { action: "mailto", place: "cv" }],
      [EVENT.emailClick, { action: "mailto", place: "cv" }],
    ]);
    // On the site the link has no tag, so a visit from the CV page does not count as a tagged link (link-ref).
    // The PDF's copy has ?utm_medium=cv-pdf, which keeps the session's ref (content-rules.test.ts).
    expect(contacts.getByRole("link", { name: "karolina.kita.company" })).toHaveAttribute("href", "/");
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

  it("name a case study's comparison and stat cards by their titles, and a screen by its caption", () => {
    renderApp("/work/smart-ticket");
    const { rebuild, impact } = SMART_TICKET_CASE;
    const [comparison] = rebuild.comparisons;
    const [screenCard] = comparison?.before.media ?? [];
    const [stat] = impact.stats;
    if (!comparison || !screenCard || !stat) throw new Error("no comparison, screen or stat");
    const block = within(screen.getByRole("article", { name: comparison.title }));
    expect(describeClick(block.getByText(comparison.before.text))).toEqual({
      element: "text",
      area: rebuild.id,
      label: comparison.title,
    });
    expect(describeClick(block.getByText(screenCard.title))).toEqual({
      element: "text",
      area: rebuild.id,
      label: screenCard.title,
    });
    // The empty space around the screen belongs to the image.
    const figure = block.getByText(screenCard.title).closest("figure");
    if (!figure) throw new Error("no figure around the screen");
    expect(describeClick(figure)).toEqual({ element: "image", area: rebuild.id, label: screenCard.title });
    expect(describeClick(screen.getByText(stat.label))).toEqual({
      element: "text",
      area: impact.id,
      label: stat.value,
    });
  });

  it("name a numbered takeaway card by its title", () => {
    renderApp("/work/automotive");
    const [point] = AUTOMOTIVE_CASE.reflections?.points ?? [];
    if (!point) throw new Error("no reflections");
    const [title, body] = point;
    expect(describeClick(screen.getByText(body))).toEqual({
      element: "text",
      area: AUTOMOTIVE_CASE.id + "-reflections",
      label: title,
    });
  });
});
