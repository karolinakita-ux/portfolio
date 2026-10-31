import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { absoluteUrl, headFor, llmsTxt } from "#app/seo/seo.utils.ts";
import { WORK_CASES } from "#features/work/index.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import type { CaseView, View } from "#shared/lib/routes/routes.types.ts";
import { isCaseView } from "#shared/lib/routes/routes.utils.ts";

// The rendered pages below: the real preloader's idle timer would outlive this file (see plain-text.test.tsx).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/**
 * One source per case name: CASE_NAMES (src/shared/lib/routes/routes.content.ts) holds each case study's title,
 * card title and short title, and every place that names a case reads them from there. The rendered checks see
 * each surface show the name the source gives it; the source scan fails when a file spells a name itself, even
 * one that matches today, because the next rename would miss it.
 */

const CASE_VIEWS: readonly CaseView[] = VIEWS.filter(isCaseView);

/** What a visitor sees naming the case studies on one page. */
interface SeenPage {
  h1: string;
  /** The breadcrumb's current page. */
  crumb: string;
  tab: string;
  /** Every link to a case study: its address and its text. */
  caseLinks: Array<{ href: string; text: string }>;
}

/** Each Work card: the case it opens, its heading and the hidden name of its thumbnail's link. */
interface SeenCard {
  href: string;
  heading: string;
  thumbnailLink: string;
}

const CASE_PATHS: ReadonlySet<string> = new Set(CASE_VIEWS.map((view) => VIEW_PATHS[view]));

function openPage(view: View): SeenPage {
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  const { unmount } = render(<App />);
  const crumbs = screen.queryByRole("navigation", { name: "Breadcrumb" });
  const seen = {
    h1: screen.getByRole("heading", { level: 1 }).textContent,
    crumb: crumbs?.querySelector('[aria-current="page"]')?.textContent ?? "(no breadcrumb)",
    tab: document.title,
    caseLinks: screen
      .getAllByRole("link")
      .map((link) => ({ href: link.getAttribute("href") ?? "", text: link.textContent }))
      .filter((link) => CASE_PATHS.has(link.href)),
  };
  unmount();
  return seen;
}

function openWorkCards(): SeenCard[] {
  window.history.replaceState(null, "", VIEW_PATHS[VIEW.work]);
  const { unmount } = render(<App />);
  const cards = WORK_CASES.map((item) => {
    const card = screen.getByRole("article", { name: CASE_NAMES[item.view].cardTitle });
    const thumbnail = card.querySelector("a[data-case-thumbnail-link]");
    return {
      href: thumbnail?.getAttribute("href") ?? "(no thumbnail link)",
      heading: within(card).getByRole("heading", { level: 3 }).textContent,
      thumbnailLink: thumbnail?.textContent ?? "(no thumbnail link)",
    };
  });
  unmount();
  return cards;
}

describe("case names, one source", () => {
  it("names every case study once, in the Work page order", () => {
    expect(Object.keys(CASE_NAMES)).toEqual(WORK_CASES.map((item) => item.view));
    expect([...CASE_VIEWS].sort()).toEqual(Object.keys(CASE_NAMES).sort());
  });

  describe("every surface reads them", () => {
    const pages = new Map<View, SeenPage>();
    let cards: SeenCard[] = [];
    beforeAll(() => {
      for (const view of CASE_VIEWS) pages.set(view, openPage(view));
      cards = openWorkCards();
    });

    it.each(CASE_VIEWS)("%s: the H1 says its title, the breadcrumb and the browser tab its short title", (view) => {
      const { title, shortTitle } = CASE_NAMES[view];
      const page = pages.get(view);
      expect(page?.h1).toBe(title);
      expect(page?.crumb).toBe(shortTitle);
      expect(page?.tab).toBe(`${shortTitle} Case Study - ${PROFILE.name}`);
    });

    it.each(CASE_VIEWS)("%s: the previous / next links that lead to it say its title", (view) => {
      const links = [...pages.values()].flatMap((page) => page.caseLinks).filter((l) => l.href === VIEW_PATHS[view]);
      expect(links.length, "links from its neighbours, at the top and the end").toBeGreaterThanOrEqual(2);
      for (const link of links) expect(link.text).toContain(CASE_NAMES[view].title);
    });

    it.each(CASE_VIEWS)("%s: its Work card and the card's thumbnail link say its card title", (view) => {
      const card = cards.find((item) => item.href === VIEW_PATHS[view]);
      expect(card?.heading).toBe(CASE_NAMES[view].cardTitle);
      expect(card?.thumbnailLink).toBe(CASE_NAMES[view].cardTitle);
    });

    it.each(CASE_VIEWS)("%s: the structured data and llms.txt name it as the page, breadcrumb and card do", (view) => {
      const { cardTitle, shortTitle } = CASE_NAMES[view];
      const head = headFor(view);
      const [page, work] = head.jsonLd["@graph"] as Array<Record<string, unknown>>;
      expect(page?.name, "WebPage: the browser tab").toBe(pages.get(view)?.tab);
      const crumbs = (page?.breadcrumb as { itemListElement: Array<Record<string, unknown>> }).itemListElement;
      expect(crumbs.at(-1)?.name, "BreadcrumbList: the short title").toBe(shortTitle);
      expect(work?.name, "CreativeWork: the card title").toBe(cardTitle);
      expect(llmsTxt()).toContain(`- [${cardTitle}](${absoluteUrl(view)}): `);
    });
  });

  describe("source scan", () => {
    /** The one file that writes the names. */
    const SOURCE = "src/shared/lib/routes/routes.content.ts";
    /** Code, copy, stories and Storybook's pages. Tests and e2e specs may quote a name as what visitors see. */
    const SCANNED = /\.(?:tsx?|mdx|html)$/;

    const LONG_NAMES = Object.values(CASE_NAMES).flatMap(({ title, cardTitle }) => [title, cardTitle]);
    const SHORT_NAMES = Object.values(CASE_NAMES).map(({ shortTitle }) => shortTitle);

    /**
     * The case names a file spells in its strings, template literals and JSX text (comments do not count): a title
     * or card title anywhere in one, a short title as the whole of one (copy may say "How Smart Ticket Helps").
     */
    const namesIn = (code: string, mdx = false): string[] => {
      const text = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
      const strings = mdx
        ? [text]
        : [...text.matchAll(/"([^"\n]*)"|`([^`]*)`|[>}]([^<>{}]+)[<{]/g)].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
      const hits = strings.flatMap((value) => [
        ...LONG_NAMES.filter((name) => value.includes(name)),
        ...SHORT_NAMES.filter((name) => value.trim() === name),
      ]);
      return [...new Set(hits)];
    };

    const files = (folder: string): string[] =>
      readdirSync(join(process.cwd(), folder), { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => relative(process.cwd(), join(entry.parentPath, entry.name)).split(sep).join("/"))
        .filter((path) => SCANNED.test(path) && !path.includes(".test.") && path !== SOURCE);

    it("finds a name in a string or JSX text, never in a comment or inside a longer phrase", () => {
      const { cardTitle } = CASE_NAMES[VIEW.caseProjectPlanning];
      const { shortTitle } = CASE_NAMES[VIEW.caseSmartTicket];
      expect(namesIn(`const card = { title: "${cardTitle}" };`)).toEqual([cardTitle]);
      expect(namesIn(`<span>${shortTitle}</span>`)).toEqual([shortTitle]);
      expect(namesIn(`const label = \`${shortTitle}\`;`)).toEqual([shortTitle]);
      expect(namesIn(`# Welcome\n\nSee ${cardTitle}.`, true)).toEqual([cardTitle]);
      expect(namesIn(`// ${cardTitle}\n/* "${shortTitle}" */\n<h4>How ${shortTitle} Helps</h4>`)).toEqual([]);
    });

    it("spells no case name outside CASE_NAMES: the Work card, the case pages, SEO and stories read it", () => {
      const scanned = [...files("src"), ...files(".storybook"), ...files("scripts"), "index.html"];
      expect(scanned).toContain("src/features/work/work.content.ts");
      expect(scanned).toContain("src/shared/ui/Breadcrumb/Breadcrumb.stories.tsx");
      const hits = scanned.flatMap((path) =>
        namesIn(readFileSync(join(process.cwd(), path), "utf8"), path.endsWith(".mdx")).map(
          (name) => `${path}: ${name}`,
        ),
      );
      expect(hits).toEqual([]);
    });
  });
});
