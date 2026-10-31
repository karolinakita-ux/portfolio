import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { render } from "@testing-library/react";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { App } from "#app/App/App.tsx";
import { PAGE_DESCRIPTIONS, PAGE_NAMES } from "#app/seo/seo.content.ts";
import { headFor, llmsTxt } from "#app/seo/seo.utils.ts";
import { ABOUT_ACTIONS, ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES } from "#features/about/about.content.ts";
import { ACCESSIBILITY } from "#features/accessibility/accessibility.content.tsx";
import type { AnyCase, ShowcaseCard } from "#features/case-studies/case-studies.types.ts";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { CONTACT } from "#features/contact/contact.content.ts";
import { CV_SHEET_ID } from "#features/cv/cv.constants.ts";
import { CV, CV_PAGE } from "#features/cv/cv.content.ts";
import { formatMonthYear } from "#features/cv/dates/dates.utils.ts";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import {
  HERO_ACTIONS,
  HERO_LEAD,
  PROCESS_BANNER,
  RECOMMENDATIONS_LINK_LABEL,
  TESTIMONIALS,
  WORK_CASES,
  WORK_INTRO,
} from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { linkRef } from "#shared/lib/analytics/payload.utils.ts";
import { SECTION, VIEW, VIEW_PATHS, VIEW_TITLES, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { hrefForView, isCaseView, isView } from "#shared/lib/routes/routes.utils.ts";
import { HOME_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";
import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { Strong } from "#shared/ui/Strong/Strong.tsx";
import {
  currencyMisses,
  frontEndSpellings,
  spelledCounts,
  straightQuotes,
  themeWording,
  titleCaseMisses,
} from "#test/copy-rules.ts";

// The rendered pages below: the real preloader's idle timer would outlive this file (see plain-text.test.tsx).
vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/** Image path under /assets: lowercase kebab-case folders and file name, web image formats. */
const ASSET_PATH = /^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(png|jpe?g|webp)$/;

/**
 * Content rules for the portfolio copy, so they hold for every future edit:
 *   - Short hyphens with spaces ("word - word", "2019 - 2026"), never en or em dashes.
 *   - The CV is plain text for applicant tracking systems: no curly quotes either, ISO dates.
 *   - H1 headings never end with a trailing period.
 *   - British spelling everywhere, like the CV; quotes from real people, names and screenshot labels stay as written.
 *   - Every case-study bullet opens with a bold lead-in term and a colon.
 *   - Headings in Title Case; curly quotes outside the CV; "frontend"; "Light and Dark mode"; counts as digits;
 *     prices as "PLN 4.40"; one label per destination; Work card tags from the case's own (src/test/copy-rules.ts).
 *   - Each case tells one version of its facts (one name for a thing, claims only what the case shows).
 *   - Navigation targets and image file names are valid on Netlify (Linux: case-sensitive).
 *   - Client and product names that may not be published never appear: not in a case study, not in
 *     any file the site, Storybook or the public repo shows (screenshots are checked by eye).
 */

/** Every visible string inside content data, including text inside JSX (bullets, swatches). */
function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value === null || value === undefined || typeof value === "boolean" || typeof value === "number") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (isValidElement(value)) return collectText((value.props as { children?: ReactNode }).children);
  if (typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}

const CASES: readonly AnyCase[] = [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE];

/** Every screenshot card of a case, as the case gallery lists them (an independent copy of gallery.utils.ts). */
const caseCards = (c: AnyCase): ShowcaseCard[] => {
  if ("sections" in c)
    return [...(c.features ?? []).flatMap((feature) => [...feature.media]), ...c.sections.flatMap((s) => [...s.cards])];
  if ("personas" in c)
    return [
      c.flow.media,
      ...c.system.cards,
      ...c.rebuild.comparisons.flatMap((comparison) => [...comparison.before.media, ...comparison.after.media]),
      ...c.passenger.cards,
      ...c.operations.screens,
    ];
  return [...c.solution, ...c.safety];
};

/** The image viewer's sharper copy of a case image, in a `zoom` folder beside it (independent of gallery.utils.ts). */
const zoomAsset = (asset: string): string => asset.replace(/[^/]+$/, "zoom/$&");

/**
 * Bullets outside the screenshot cards: feature sections, the impact section, the Data Governance case's reality
 * list, Smart Ticket's personas, comparison reasoning and console decisions.
 */
const caseBullets = (c: AnyCase): ReactNode[] => {
  if ("sections" in c)
    return [...(c.features ?? []).flatMap((feature) => [...feature.bullets]), ...(c.impact?.bullets ?? [])];
  if ("personas" in c)
    return [
      ...c.personas.personas.flatMap((persona) => [...persona.problems, ...persona.helps]),
      ...c.rebuild.comparisons.flatMap((comparison) =>
        (comparison.rationale ?? []).flatMap((column) => [...column.points]),
      ),
      ...c.operations.decisions,
    ];
  return [...c.reality];
};

const ALL_CONTENT = {
  ABOUT_INTRO,
  ACCESSIBILITY,
  FAQ,
  MILESTONES,
  PRINCIPLES,
  CONTACT,
  CV,
  CV_PAGE,
  PRIVACY,
  PROFILE,
  PROCESS_BANNER,
  TESTIMONIALS,
  HERO_LEAD,
  WORK_CASES,
  WORK_INTRO,
  CASES,
};

/** All the site's copy as data: the pages' content, the buttons, the search copy and the page names. */
const SITE_COPY = {
  ...ALL_CONTENT,
  ABOUT_ACTIONS,
  HERO_ACTIONS,
  RECOMMENDATIONS_LINK_LABEL,
  HOME_CRUMB,
  PAGE_DESCRIPTIONS,
  PAGE_NAMES,
  VIEW_TITLES,
};

describe("copy style", () => {
  it("uses short hyphens, never en or em dashes", () => {
    const offending = collectText(ALL_CONTENT).filter((text) => /[–—]/.test(text));
    expect(offending).toEqual([]);
  });

  it("keeps the CV ATS-safe (no curly quotes)", () => {
    const offending = collectText({ CV }).filter((text) => /[‘’“”]/.test(text));
    expect(offending).toEqual([]);
  });

  it("never ends an H1 with a period", () => {
    const h1s = [...CASES.map((c) => c.title), CONTACT.title, PRIVACY.title, ACCESSIBILITY.title, CV.header.name];
    for (const title of h1s) expect(title.trimEnd()).not.toMatch(/\.$/);
  });
});

/**
 * Common US spellings, as whole words in any case with their inflections: the site writes British English
 * everywhere, like the CV (Karolina, 2026-10-30). -ize and -yze (size, seize, prize and their kin keep the z, also inside a word: oversize, assetSize), -or
 * for -our, -er for -re, one l where British doubles it (with their common prefixes: multicolor, dishonor,
 * relabeled), and single words. Not listed, because British English uses them too: "dialog" (a software dialog),
 * "program" (software; a plan is a programme), "license" (the verb; the noun is licence) and "practice" (the noun;
 * the verb is practise, so practiced and practicing are listed). Their other senses are checked by eye.
 */
const US_SPELLING = new RegExp(
  [
    String.raw`\b(?![a-z]*(?:siz|seiz|priz|maiz|baiz))[a-z]+[iy]z(?:e|es|ed|ing|ation|ations|er|ers|able)\b`,
    String.raw`\b(?:multi|water|tri|dis|re|un|mis)?(?:col|behavi|fav|hon|hum|lab|neighb|flav|harb|rum|vap|endeav|arm|od|cand|vig|val|sav|parl|clam|rig|tum|splend|ard|ferv|demean)or(?:s|ed|ing|ful|fully|less|al|ally|ite|ites|able|ably|y|blind|hood|hoods)?\b`,
    String.raw`\b(?:cent|theat|fib|lit|somb|calib|spect|lust|sab|(?:kilo|centi|milli)met)ers?\b|\bcenter(?:ed|ing|piece|pieces)\b`,
    String.raw`\b(?:re|un|mis)?(?:label|model|travel|cancel|level|signal|fuel|total|channel|funnel|tunnel|counsel|marvel|jewel|dial|duel|quarrel|rival|shovel|unravel|panel|pedal|equal|initial|spiral)(?:ed|ing)\b`,
    String.raw`\b(?:travel|model|label|level|jewel)ers?\b|\bcounselors?\b|\bjewelry\b|\bmarvelous(?:ly)?\b`,
    String.raw`\b(?:enroll(?:s|ment|ments)?|fulfill(?:s|ment|ments)?|skillful(?:ly)?|willful(?:ly)?|installments?)\b`,
    String.raw`\b(?:gray(?:s|ed|ing|ish|scale)?|defenses?|offenses?|pretenses?|artifacts?|catalog(?:s|ed|ing)?|analogs?|skeptic(?:al|ally|ism|s)?)\b`,
    String.raw`\b(?:acknowledgments?|practic(?:ed|ing)|esthetics?|maneuver(?:s|ed|ing|able)?)\b`,
  ].join("|"),
  "gi",
);

/** Written as they are: a fictional company's name, and product labels quoted as the screenshots show them. */
const KEPT_AS_WRITTEN = /\bHarbor Bank\b|\bDuplicate to customize\b|\bParticipant (?:\/|and) Organizer\b/gi;

/** Strings in content data that are code or a real person's words, not the site's copy. */
const NOT_COPY = new Set(["id", "asset", "darkAsset", "detail", "color", "background", "quote"]);

/** A value that is code under a key that elsewhere holds copy: a view id ("View CV" is copy), a stylesheet's lines. */
const isCode = (key: string, item: unknown, parent: object): boolean =>
  (key === "view" && typeof item === "string" && isView(item)) ||
  (key === "lines" && "kind" in parent && parent.kind === "code");

/** collectText without ids, image paths, CSS values, stylesheet lines and quotes from real people. */
function collectCopy(value: unknown): string[] {
  if (isValidElement(value)) return collectCopy((value.props as { children?: ReactNode }).children);
  if (Array.isArray(value)) return value.flatMap(collectCopy);
  if (value !== null && typeof value === "object")
    return Object.entries(value).flatMap(([key, item]) =>
      NOT_COPY.has(key) || isCode(key, item, value) ? [] : collectCopy(item),
    );
  return collectText(value).filter((text) => !/^(?:https?|mailto):/.test(text));
}

/** US spellings in texts, ignoring the kept phrases and web addresses. */
const usSpellings = (texts: readonly string[]): string[] =>
  texts.flatMap((text) =>
    (
      text
        .replace(KEPT_AS_WRITTEN, "")
        .replace(/(?:https?|mailto):[^\s)"]+/g, "")
        .match(US_SPELLING) ?? []
    ).map((word) => `${word}: ${text.slice(0, 80)}`),
  );

/** Source files with visible text: components, stories, label constants, Storybook's pages and toolbar. */
const SOURCE_WITH_TEXT = /\.(?:tsx?|mdx)$/;
/** Copy files are checked as data; styles, types and tests are code; icon names are lucide's ("maximize-2"). */
const SOURCE_WITHOUT_TEXT = /\.(?:test|content|styles|types|d)\.tsx?$|\/icons\//;
/** CSS media queries in code ("(prefers-color-scheme: dark)"). */
const MEDIA_QUERY = /^\(prefers-[a-z-]+: [a-z-]+\)$/;

/** The source files with visible text (see SOURCE_WITH_TEXT), Storybook's pages and toolbar included. */
const textSources = (): string[] =>
  [...publishedFiles("src"), ...publishedFiles(".storybook")].filter(
    (path) => SOURCE_WITH_TEXT.test(path) && !SOURCE_WITHOUT_TEXT.test(path),
  );

/** A source file's string literals, template literals and JSX text, without comments; an MDX page is prose throughout. */
function sourceStrings(path: string): string[] {
  const code = readFileSync(join(process.cwd(), path), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
  if (path.endsWith(".mdx")) return [code];
  return [...code.matchAll(/"([^"\n]*)"|`([^`]*)`|[>}]([^<>{}]+)[<{]/g)].map(
    (match) => match[1] ?? match[2] ?? match[3] ?? "",
  );
}

const INDEX_HTML = readFileSync(join(process.cwd(), "index.html"), "utf8");
/** index.html's own copy: the meta tags' content (description, link previews) and the title. */
const INDEX_COPY = [
  ...[...INDEX_HTML.matchAll(/<meta\s[^>]*content="([^"]*)"/g)].map((match) => match[1] ?? ""),
  /<title>([^<]*)<\/title>/.exec(INDEX_HTML)?.[1] ?? "",
];

describe("British spelling", () => {
  it("in the copy, the search copy, the structured data, llms.txt and the link previews (quotes stay verbatim)", () => {
    const html = INDEX_HTML;
    const siteJsonLd = JSON.parse(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "{}",
    ) as unknown;
    const pageJsonLd = VIEWS.map((view) => headFor(view).jsonLd);
    const copy = [...collectCopy({ ...SITE_COPY, siteJsonLd, pageJsonLd }), ...INDEX_COPY, ...llmsTxt().split("\n")];
    expect(copy.length).toBeGreaterThan(1000);
    expect(copy).toContain("UX case study");
    expect(copy).toContain(CONTACT.cv.view);
    expect(usSpellings(copy)).toEqual([]);
    expect(html).toContain('<meta property="og:locale" content="en_GB" />');
  });

  it("in the components' own text and labels, the label constants, the stories and Storybook's pages", () => {
    const files = textSources();
    expect(files.length).toBeGreaterThan(200);
    expect(files).toContain(".storybook/Welcome.mdx");
    const hits = files.flatMap((path) =>
      usSpellings(sourceStrings(path).filter((text) => !MEDIA_QUERY.test(text))).map((hit) => `${path}: ${hit}`),
    );
    expect(hits).toEqual([]);
  });
});

/** The site's copy without the CV, which keeps straight quotes for applicant tracking systems. */
const COPY_WITHOUT_CV = collectCopy(Object.fromEntries(Object.entries(SITE_COPY).filter(([key]) => key !== "CV")));

/** Rows "rule hit: text" for a test's failure message. */
const hitsIn = (texts: readonly string[], rule: (text: string) => string[]): string[] =>
  texts.flatMap((text) => rule(text).map((hit) => `${hit}: ${text.slice(0, 100)}`));

/** Keys whose values are eyebrows or titles that are not headings: Title Case like the headings. */
const TITLE_KEYS: ReadonlySet<string> = new Set(["eyebrow", "summaryTitle", "decisionsTitle"]);

/** The strings held under the given keys anywhere in content data. */
function valuesUnder(value: unknown, keys: ReadonlySet<string>): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => valuesUnder(item, keys));
  if (value === null || typeof value !== "object" || isValidElement(value)) return [];
  return Object.entries(value).flatMap(([key, item]) => (keys.has(key) ? collectText(item) : valuesUnder(item, keys)));
}

/** Karolina's answers of 2026-10-30, one rule each (CLAUDE.md, Copy rules). */
describe("one style across the site", () => {
  const copy = collectCopy(SITE_COPY);

  it("writes curly quotes and apostrophes (’ “ ”) in the copy, alt text, search copy and index.html; the CV keeps straight ones", () => {
    expect(COPY_WITHOUT_CV.length).toBeGreaterThan(1000);
    expect(COPY_WITHOUT_CV).toContain(CV_PAGE.inAppHint);
    expect(COPY_WITHOUT_CV).not.toContain(CV.summary);
    expect(hitsIn([...COPY_WITHOUT_CV, ...INDEX_COPY], straightQuotes)).toEqual([]);
  });

  it("writes curly apostrophes in the components' own text, the stories and Storybook's pages too", () => {
    const hits = textSources().flatMap((path) =>
      sourceStrings(path)
        .filter((text) => /\p{L}'\p{L}|&(?:quot|apos|#39);/u.test(text))
        .map((text) => `${path}: ${text.trim().slice(0, 100)}`),
    );
    expect(hits).toEqual([]);
  });

  it("writes frontend, never front-end", () => {
    expect(hitsIn(copy, frontEndSpellings)).toEqual([]);
  });

  it("writes Light and Dark mode, capitalised as the theme switch names them, in one pattern", () => {
    const welcome = readFileSync(join(process.cwd(), ".storybook", "Welcome.mdx"), "utf8");
    expect(hitsIn([...copy, ...welcome.split("\n")], themeWording)).toEqual([]);
  });

  it("writes counts and measures as digits, except at the start of a sentence and in quotes", () => {
    expect(hitsIn(copy, spelledCounts)).toEqual([]);
  });

  it("writes prices as the copy does (PLN 4.40), also where it quotes a Polish screen", () => {
    expect(hitsIn(copy, currencyMisses)).toEqual([]);
  });

  it("writes eyebrows, detail labels and the titles of summaries, columns and lists in Title Case, like headings", () => {
    const comparisons = SMART_TICKET_CASE.rebuild.comparisons;
    const titles = [
      ...valuesUnder(SITE_COPY, TITLE_KEYS),
      ...CASES.flatMap((c) => [
        ...c.meta.map((entry) => entry.label),
        ...c.summary.flatMap((column) => column.title ?? []),
      ]),
      ...comparisons.flatMap((comparison) => [comparison.before.label, comparison.after.label]),
      ...comparisons.flatMap((comparison) => [
        ...(comparison.rationale ?? []).map((column) => column.title),
        ...(comparison.shift ? [comparison.shift.title] : []),
      ]),
      SMART_TICKET_CASE.operations.scope.title,
    ];
    expect(titles).toContain("My Role");
    expect(titles).toContain(SMART_TICKET_CASE.operations.decisionsTitle);
    expect(titles.length).toBeGreaterThan(50);
    expect(titles.flatMap((title) => titleCaseMisses(title).map((word) => `"${word}" in ${title}`))).toEqual([]);
  });

  it("takes each Work card's eyebrow tags from its case study's, in the same words", () => {
    for (const card of WORK_CASES) {
      const tags = CASES.find((c) => c.view === card.view)?.eyebrow ?? [];
      for (const tag of card.eyebrow) expect(tags, `${card.id}: "${tag}"`).toContain(tag);
    }
  });

  it("names each link destination one way: the case list's buttons, and Explore for Figma, GitHub and Storybook", () => {
    expect(ABOUT_ACTIONS.work).toBe(HERO_ACTIONS.cases);
    const explore = [PROCESS_BANNER.linkLabel, PROCESS_BANNER.sourceLinkLabel, PROCESS_BANNER.componentsLinkLabel];
    const designFiles = CASES.flatMap((c) => (c.designFile ? [c.designFile.linkLabel] : []));
    for (const label of [...explore, ...designFiles]) expect(label).toMatch(/^Explore /);
    // Storybook's Welcome page links the Figma workspace and the code with the Work page's labels.
    const welcome = readFileSync(join(process.cwd(), ".storybook", "Welcome.mdx"), "utf8");
    expect(welcome).toContain(`{ label: "${PROCESS_BANNER.linkLabel}", href: PROFILE.figmaWorkspaceUrl }`);
    expect(welcome).toContain(`{ label: "${PROCESS_BANNER.sourceLinkLabel}", href: PROFILE.repositoryUrl }`);
  });
});

/** The texts of one case study: the case, its Work card and its search description. */
const caseTexts = (c: AnyCase): string[] =>
  collectCopy({ c, card: WORK_CASES.filter((card) => card.view === c.view), page: PAGE_DESCRIPTIONS[c.view] });

describe("case facts, one version per case", () => {
  it("Project Planning claims only what it shows: no budget guardrails, no discovery, design from requirements to delivery", () => {
    const texts = caseTexts(PROJECT_PLANNING_CASE);
    expect(hitsIn(texts, (text) => text.match(/guardrails?|\bdiscovery\b|problem definition/gi) ?? [])).toEqual([]);
    expect(texts.filter((text) => text.includes("from requirements to delivery"))).toHaveLength(1);
    // Her title there is the CV's for that contract (Programado): Senior Product Designer (Karolina, 2026-10-31).
    const role = PROJECT_PLANNING_CASE.meta.find((item) => item.label === "My Role")?.value;
    expect(role).toMatch(/^Senior Product Designer - /);
  });

  it("Smart Ticket calls its console the operations console, as its section heading does", () => {
    const otherNames = /\b(?:web|admin|municipal)\s+console\b|\badmin (?:web app|product)\b|\bweb app\b/gi;
    expect(hitsIn(caseTexts(SMART_TICKET_CASE), (text) => text.match(otherNames) ?? [])).toEqual([]);
  });

  it("Smart Ticket quotes one lowest text contrast: the text/muted floor its design system states", () => {
    const floor = /the lowest, text\/muted, is (\d+(?:\.\d+)?:1)/.exec(caseTexts(SMART_TICKET_CASE).join("\n"))?.[1];
    expect(floor).toBe("4.9:1");
    const after = SMART_TICKET_CASE.rebuild.comparisons.flatMap((comparison) => comparison.after.metrics ?? []);
    const lowest = after.filter((metric) => metric.startsWith("Lowest text"));
    expect(lowest.length).toBeGreaterThan(0);
    for (const metric of lowest) expect(metric).toBe(`Lowest text ${floor ?? ""}`);
  });

  it("Automotive lists the payment methods its screens show: card or dealer finance, no bank transfer", () => {
    const texts = caseTexts(AUTOMOTIVE_CASE);
    expect(hitsIn(texts, (text) => text.match(/\btransfers?\b/gi) ?? [])).toEqual([]);
    const lists = texts.filter((text) => /dealer finance/i.test(text));
    expect(lists.length).toBeGreaterThanOrEqual(2);
    for (const text of lists) expect(text).toContain("card or dealer finance");
  });

  it("Theme Generator uses one term for the public bodies it serves", () => {
    const text = caseTexts(DATA_GOVERNANCE_CASE).join("\n");
    expect(/federal/i.test(text) && /public sector/i.test(text), "both federal institutions and public sector").toBe(
      false,
    );
  });
});

/** One page as App renders it: headings, the text people see or hear (alt text, labels), and its links. */
interface RenderedPage {
  view: View;
  headings: string[];
  texts: string[];
  links: Array<{ href: string; label: string }>;
}

/**
 * Elements whose text is not the site's copy: code, the CV sheet (straight quotes for applicant tracking systems)
 * and the recommendations (real people's words, verbatim).
 */
const NOT_COPY_ELEMENTS = [
  "script, style, code, code *, pre, pre *",
  `#${CV_SHEET_ID}, #${CV_SHEET_ID} *`,
  "blockquote[cite], blockquote[cite] *",
].join(", ");

function renderPage(view: View): RenderedPage {
  window.history.replaceState(null, "", VIEW_PATHS[view]);
  const { baseElement, unmount } = render(createElement(App));
  const headings = [...baseElement.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => h.textContent);
  const elements = [...baseElement.querySelectorAll("*")].filter((element) => !element.matches(NOT_COPY_ELEMENTS));
  const texts = elements.flatMap((element) => [
    ...[...element.childNodes].flatMap((node) => (node.nodeType === Node.TEXT_NODE ? [node.textContent ?? ""] : [])),
    ...["alt", "aria-label", "title", "placeholder"].flatMap((name) => element.getAttribute(name) ?? []),
  ]);
  const links = [...baseElement.querySelectorAll("a[href]")]
    .filter((link) => !link.closest('nav[aria-label="Breadcrumb"]'))
    .map((link) => ({
      href: link.getAttribute("href") ?? "",
      label: link.textContent.replace(/\s*\((?:opens in a new tab|opens your email app)\)/, "").trim(),
    }));
  unmount();
  return { view, headings, texts, links };
}

describe("rendered pages", () => {
  let pages: RenderedPage[] = [];
  beforeAll(() => {
    pages = VIEWS.map(renderPage);
  });

  it("writes every heading in Title Case, and the consent box's title (minor words stay lowercase inside)", () => {
    expect(pages.flatMap((page) => page.headings).length).toBeGreaterThan(100);
    const titles: Array<{ where: string; heading: string }> = pages.flatMap((page) =>
      page.headings.map((heading) => ({ where: page.view, heading })),
    );
    titles.push({ where: "consent box", heading: PRIVACY.consent.title });
    const misses = titles.flatMap(({ where, heading }) =>
      titleCaseMisses(heading).map((word) => `${where}: "${word}" in ${heading}`),
    );
    expect(misses).toEqual([]);
  });

  it("writes curly quotes in every page's text, alt text and labels, the CV sheet aside", () => {
    const hits = pages.flatMap((page) => hitsIn(page.texts, straightQuotes).map((hit) => `${page.view}: ${hit}`));
    expect(hits).toEqual([]);
  });

  it("writes frontend, Light and Dark mode, digits and PLN in every page's text, alt text and labels too", () => {
    const rules = [frontEndSpellings, themeWording, spelledCounts, currencyMisses];
    const texts = pages.flatMap((page) => page.texts.map((text) => ({ view: page.view, text })));
    expect(texts.length).toBeGreaterThan(1000);
    expect(texts.map(({ text }) => text)).toContain("Dark mode"); // the theme switch's label
    const hits = texts.flatMap(({ view, text }) =>
      rules.flatMap((rule) => hitsIn([text], rule)).map((hit) => `${view}: ${hit}`),
    );
    expect(hits).toEqual([]);
  });

  it("gives one destination one label: the case list, and Explore links for Figma, GitHub and Storybook", () => {
    const links = pages.flatMap((page) => page.links);
    const caseList = links.filter((link) => link.href === hrefForView(VIEW.work, SECTION.workCases));
    expect(caseList.length).toBeGreaterThanOrEqual(3); // Work hero, About hero, About career
    expect(new Set(caseList.map((link) => link.label))).toEqual(new Set([HERO_ACTIONS.cases]));
    const design = links.filter(
      (link) =>
        link.href.startsWith("https://www.figma.com/") ||
        link.href === PROFILE.repositoryUrl ||
        link.href === PROFILE.storybookUrl,
    );
    expect(design.length).toBeGreaterThanOrEqual(4);
    for (const link of design) expect(link.label, link.href).toMatch(/^Explore /);
  });
});

const CASE_TABLE = CASES.map((c): [string, AnyCase] => [c.shortTitle, c]);

describe.each(CASE_TABLE)("case study: %s", (_name, c) => {
  const cards = caseCards(c);
  const { view } = c;

  it("names its own case view (the screenshot folder below checks which one)", () => {
    expect(view.startsWith("case-")).toBe(true);
  });

  it("opens every bullet with a bold lead-in term and a colon", () => {
    const bullets: ReactNode[] = [...cards.flatMap((card) => card.bullets ?? []), ...caseBullets(c)];
    for (const bullet of bullets) {
      expect(isValidElement(bullet), "bullet must be JSX (use lead())").toBe(true);
      const children = (bullet as ReactElement<{ children?: ReactNode }>).props.children;
      const first: ReactNode = Array.isArray(children) ? (children as ReactNode[])[0] : children;
      expect(
        isValidElement(first) && first.type === Strong,
        `first child must be <Strong>: ${collectText(bullet).join("")}`,
      ).toBe(true);
      expect(collectText(first).join("")).toMatch(/\S:$/);
    }
  });

  it("links prev / next to other existing views", () => {
    for (const target of [c.prev, c.next]) {
      if (!target) continue;
      expect(isView(target.view)).toBe(true);
    }
  });

  it("uses unique keys (card ids, meta labels, summary columns)", () => {
    const unique = (values: string[]) => expect(new Set(values).size).toBe(values.length);
    unique(cards.map((card) => card.id));
    unique(c.meta.map((entry) => entry.label));
    unique(c.summary.map((column) => column.title ?? column.body));
  });

  it("marks Polish phrases in case studies with lang=pl (WCAG 3.1.2)", () => {
    const POLISH_LETTERS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
    const unmarked: string[] = [];
    const walk = (value: unknown, inPolish: boolean): void => {
      if (typeof value === "string") {
        if (!inPolish && POLISH_LETTERS.test(value)) unmarked.push(value.trim());
      } else if (Array.isArray(value)) value.forEach((v) => walk(v, inPolish));
      else if (isValidElement(value)) {
        const props = value.props as { children?: ReactNode; lang?: string };
        walk(props.children, inPolish || (value.type === Lang && props.lang === "pl"));
      } else if (value !== null && typeof value === "object") Object.values(value).forEach((v) => walk(v, inPolish));
    };
    walk(c, false);
    expect(unmarked).toEqual([]);
  });

  it("keeps screenshots in the case's own folder, named in lowercase kebab-case (Netlify paths are case-sensitive)", () => {
    const folder = "cases/" + VIEW_PATHS[view].split("/").pop() + "/";
    for (const card of cards) {
      expect(card.asset).toMatch(ASSET_PATH);
      expect(card.asset.startsWith(folder), card.asset).toBe(true);
      if (card.detail) expect(card.detail).toMatch(ASSET_PATH);
      if (card.darkAsset) {
        expect(card.darkAsset).toMatch(ASSET_PATH);
        expect(card.darkAsset.startsWith(folder), card.darkAsset).toBe(true);
      }
    }
  });
});

describe("work page", () => {
  it("lists every case study exactly once, each pointing at a case view", () => {
    const caseViews = VIEWS.filter(isCaseView);
    expect(WORK_CASES.map((item) => item.view).sort()).toEqual([...caseViews].sort());
  });

  it("uses unique, valid thumbnail names", () => {
    const assets = WORK_CASES.map((item) => item.asset);
    expect(new Set(assets).size).toBe(assets.length);
    for (const asset of assets) expect(asset).toMatch(ASSET_PATH);
  });

  it("names each case one way: its browser tab says the breadcrumb name, and the H1 contains every word of it", () => {
    for (const c of CASES) {
      expect(VIEW_TITLES[c.view], c.view).toBe(`${c.shortTitle} Case Study - ${PROFILE.name}`);
      for (const word of c.shortTitle.split(" ")) expect(c.title, c.view).toContain(word);
    }
  });

  it("chains case studies in the same order as the Work page", () => {
    const order = WORK_CASES.map((item) => item.view);
    const byView: Partial<Record<View, AnyCase>> = {
      [VIEW.caseSmartTicket]: SMART_TICKET_CASE,
      [VIEW.caseAutomotive]: AUTOMOTIVE_CASE,
      [VIEW.caseProjectPlanning]: PROJECT_PLANNING_CASE,
      [VIEW.caseDataGovernance]: DATA_GOVERNANCE_CASE,
    };
    order.forEach((view, index) => {
      const next = order[index + 1];
      if (next) expect(byView[view]?.next?.view, view).toBe(next);
    });
  });
});

describe("CV", () => {
  const entries = [...CV.experience, ...CV.education];

  it("uses valid ISO dates, the start before the end", () => {
    for (const entry of entries) {
      expect(() => formatMonthYear(entry.start), entry.id).not.toThrow();
      if (entry.end) {
        expect(() => formatMonthYear(entry.end ?? ""), entry.id).not.toThrow();
        expect(entry.start <= entry.end, entry.id).toBe(true);
      }
    }
  });

  it("writes lead-ins without their own colon (lead() adds it) and gives each entry its own id", () => {
    for (const bullet of entries.flatMap((entry) => entry.bullets)) expect(bullet.lead).not.toMatch(/:\s*$/);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
  });

  it("gives every job a full set of its own bullets, none copied from another entry", () => {
    // Both GlobalLogic titles keep a full set (Karolina, 2026-10-31): the work ran through both roles.
    for (const job of CV.experience) expect(job.bullets.length, job.id).toBeGreaterThanOrEqual(3);
    const bullets = entries.flatMap((entry) => entry.bullets);
    expect(new Set(bullets.map((bullet) => bullet.lead)).size).toBe(bullets.length);
    expect(new Set(bullets.map((bullet) => bullet.text)).size).toBe(bullets.length);
    // The earlier title claims no leading, strategy, roadmaps or workshops: those were the Senior role's.
    const earlier = CV.experience.filter((job) => job.title === "UX/UI Designer").flatMap((job) => job.bullets);
    expect(earlier.length).toBeGreaterThan(0);
    const claims = collectText(earlier).filter((text) => /\blead|\bled\b|strateg|roadmap|workshop/i.test(text));
    expect(claims).toEqual([]);
  });

  it("shares the contact details with the profile, and marks the PDF's portfolio link for the UTM report only", () => {
    expect(CV.header.name).toBe(PROFILE.name);
    expect(CV.header.email).toBe(PROFILE.email);
    expect(CV.header.linkedin.href).toBe(PROFILE.linkedinUrl);
    // The visible text is the full address (https:// included), so parsers and printouts read it as a link.
    expect(CV.header.linkedin.label).toBe(PROFILE.linkedinUrl);
    expect(CV.header.site.label).toMatch(/^https:\/\/[^/]+$/);
    expect(CV.header.site.pdfHref).toBe(CV.header.site.label + "/?utm_medium=cv-pdf");
    // Not a link tag: it would replace the session's ref (the company a /cv?ref=acme link brought) with its own.
    expect(linkRef(new URL(CV.header.site.pdfHref).search)).toBeNull();
    expect(CV.footer).toBe(PROFILE.name + " · " + PROFILE.role);
  });

  it("gives the recruitment consent in English only, for recruiters in Poland or abroad, with the email address once", () => {
    const consent = CV.consent;
    expect(consent.split("{email}")).toHaveLength(2);
    expect(consent).toMatch(/^I consent to the processing of my personal data/);
    expect(consent).toContain("in Poland or abroad");
    expect(consent).toContain("GDPR (Regulation (EU) 2016/679)");
    expect(consent).toContain("future recruitment processes");
    expect(/\d+ months/.exec(consent)?.[0]).toBe("12 months");
    expect(consent).toMatch(/withdraw my consent at any time/);
    // One language: the CV's (no Polish paragraph beside it).
    expect(consent).not.toMatch(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/);
  });
});

/**
 * Karolina's job facts, one version everywhere (her answers of 2026-10-30). The CV is the source; About, Contact,
 * the search copy and index.html follow it. Quotes from real people (TESTIMONIALS) stay verbatim, so they are left out.
 */
describe("profile facts", () => {
  type Job = (typeof CV.experience)[number];
  const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
  const jsonLd = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "{}";
  const person = (JSON.parse(jsonLd) as { "@graph": Array<Record<string, unknown>> })["@graph"].find(
    (node) => node["@type"] === "Person",
  ) as { description: string; jobTitle: string; knowsAbout: string[]; hasCredential: Array<{ name: string }> };
  const profileDescriptions = [VIEW.work, VIEW.about, VIEW.contact, VIEW.cv].map((view) => PAGE_DESCRIPTIONS[view]);
  /** Everything the site says, case studies included, and index.html line by line. */
  const ownText = [...collectText({ ...ALL_CONTENT, TESTIMONIALS: [], PAGE_DESCRIPTIONS }), ...html.split("\n")];
  /** What the site says about her: About, the CV, Contact, the profile, search copy and index.html. */
  const profileText = [
    ...collectText({ ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES, CV, CONTACT, PROFILE, HERO_LEAD, profileDescriptions }),
    ...html.split("\n"),
  ];
  const employer = (entry: Job): string => entry.org[0] ?? "";
  const milestoneOf = (entry: Job) => MILESTONES.find((item) => item.org.startsWith(employer(entry) + " - "));

  it("writes UX/UI, never UI/UX", () => {
    expect(ownText.filter((text) => /\bUI\s*\/\s*UX\b/.test(text))).toEqual([]);
  });

  it("names the degree as the CV does (MSc in Psychology), never M.Sc. or Master's Degree, in the structured data too", () => {
    expect(ownText.filter((text) => /\bM\.\s?Sc\b|\bMaster(?:['’]s)? (?:degree|of science)/i.test(text))).toEqual([]);
    expect(person.hasCredential.map((credential) => credential.name)).toEqual(CV.education.map((entry) => entry.title));
    // "MSc" alone only as the CV research bullet's "(MSc)". The link-preview alt texts copy the cover image, which
    // still reads "MSc Psychology" until Karolina re-exports it as "MSc in Psychology" (Figma follow-up, 2026-10-30).
    const imageAlts = [...html.matchAll(/<meta\s+(?:property|name)="(?:og|twitter):image:alt"\s+content="([^"]*)"/g)];
    const altTexts = imageAlts.map((match) => match[1] ?? "");
    expect(altTexts).toHaveLength(2);
    const shortForms = ownText.filter(
      (text) => !altTexts.some((alt) => text.includes(alt)) && /(?<!\()\bMSc\b(?! in Psychology)/.test(text),
    );
    expect(shortForms).toEqual([]);
  });

  it("says she mentored a UX intern at Programado, never a junior designer", () => {
    expect(ownText.filter((text) => /\bjunior designers?\b/i.test(text))).toEqual([]);
  });

  it("says the 8+ years were mostly, not all, on B2B and enterprise platforms (her first job was consumer FinTech)", () => {
    const claims = ownText.flatMap((text) => text.match(/[^.]*8\+ years[^.]*/g) ?? []);
    expect(claims.length).toBeGreaterThan(0);
    const unqualified = claims.filter(
      (claim) => /B2B|enterprise/i.test(claim) && !claim.includes("8+ years, mostly on B2B and enterprise platforms"),
    );
    expect(unqualified).toEqual([]);
  });

  it("calls her a Design Systems Specialist, one form, plural as the CV names the skill", () => {
    const forms = ownText.flatMap((text) => text.match(/design systems? specialist/gi) ?? []);
    expect(forms.length).toBeGreaterThan(0);
    expect(new Set(forms)).toEqual(new Set(["Design Systems Specialist"]));
  });

  it("gives one WCAG version in claims about her, the CV's skills' (a case study keeps its project's)", () => {
    const VERSION = /WCAG \d\.\d(?: A{1,3}\b)?/g;
    const cvForm = collectText(CV.skills).join("\n").match(VERSION)?.[0];
    expect(cvForm).toBeDefined();
    const claims = collectText({ ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES, CONTACT, profileDescriptions });
    const forms = [...claims, CV.summary, ...person.knowsAbout].flatMap((text) => text.match(VERSION) ?? []);
    expect(new Set(forms)).toEqual(new Set([cvForm]));
  });

  it("names her employer GlobalLogic Poland in her job history", () => {
    expect(profileText.filter((text) => /GlobalLogic(?! Poland)/.test(text))).toEqual([]);
  });

  it("gives About's career each employer and title of the CV", () => {
    // A title of its own, after "Employer - ", ", " or "then ": "Junior UX Researcher" does not name "UX Researcher".
    const names = (org: string, title: string): boolean =>
      org
        .split(title)
        .slice(0, -1)
        .some((before) => /(?:- |, |then )$/.test(before));
    for (const entry of [...CV.experience, ...CV.education]) {
      const org = milestoneOf(entry)?.org ?? "";
      expect(names(org, entry.title), `${entry.id}: "${org}" names "${entry.title}"`).toBe(true);
    }
  });

  it("gives About's career the CV's years: each employer's span, and the years after a title", () => {
    const year = (date: string | null): string => date?.slice(0, 4) ?? "Present";
    const entries: readonly Job[] = [...CV.experience, ...CV.education];
    for (const milestone of MILESTONES) {
      const jobs = entries.filter((entry) => milestone.org.startsWith(employer(entry) + " - "));
      expect(jobs.length, `${milestone.id}: a CV entry for "${milestone.org}"`).toBeGreaterThan(0);
      const start = jobs.reduce((min, job) => (job.start < min ? job.start : min), "9999-12");
      const ongoing = jobs.some((job) => job.end === null);
      const end = ongoing ? null : jobs.reduce((max, job) => ((job.end ?? "") > max ? (job.end ?? "") : max), "");
      expect(milestone.period, milestone.id).toBe(`${year(start)} - ${year(end)}`);
      for (const job of jobs) {
        const title = job.title.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
        const after = new RegExp(String.raw`(?:- |, |then )${title} \((\d{4}) - (\d{4}|Present)\)`).exec(milestone.org);
        if (after)
          expect(`${after[1] ?? ""} - ${after[2] ?? ""}`, `${job.id} in "${milestone.org}"`).toBe(
            `${year(job.start)} - ${year(job.end)}`,
          );
      }
    }
  });

  it("says a job ran alongside another employer's where the dates overlap, on the CV and on About", () => {
    const until = (end: string | null): string => end ?? "9999-12";
    const overlap = (a: Job, b: Job): boolean =>
      employer(a) !== employer(b) && a.start < until(b.end) && b.start < until(a.end);
    const saysAlongside = (job: Job): boolean => job.org.some((part) => /\balongside\b/i.test(part));
    for (const [index, a] of CV.experience.entries()) {
      for (const b of CV.experience.slice(index + 1).filter((other) => overlap(a, other))) {
        const side = [a, b].find(saysAlongside);
        expect(side, `${a.id} and ${b.id} overlap: say "alongside" on the side job`).toBeDefined();
        if (side) expect(milestoneOf(side)?.org, side.id).toMatch(/\balongside\b/i);
      }
    }
  });

  it("keeps index.html's description and person in step with the Work page and the profile", () => {
    const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1];
    expect(description).toBe(PAGE_DESCRIPTIONS[VIEW.work]);
    expect(person.description).toBe(PAGE_DESCRIPTIONS[VIEW.work]);
    expect(person.jobTitle).toBe(PROFILE.role);
  });
});

describe("LinkedIn links", () => {
  it("point the recommendations link at the profile", () => {
    expect(PROFILE.linkedinRecommendationsUrl.startsWith(PROFILE.linkedinUrl + "/")).toBe(true);
  });

  it("links every recommendation to LinkedIn pages of its author and company", () => {
    for (const item of TESTIMONIALS) {
      expect(item.profileUrl).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/$/);
      expect(item.company.url).toMatch(/^https:\/\/www\.linkedin\.com\/company\/[\w-]+\/$/);
      expect(item.role).not.toContain("|"); // the company is its own field
    }
  });
});

/**
 * Names that may not be published, as SHA-256 of the lowercase word, so the public repo never spells them.
 * HIDDEN: clients, their products and partners, kept out of every published file.
 * HIDDEN_IN_CASES: also kept out of the case studies (copy, alt text, file names, search copy); the Work
 * page quotes may still name the recommender's employer. Hash a new name with:
 *   node -e "console.log(require('node:crypto').createHash('sha256').update('name').digest('hex'))"
 */
const HIDDEN = new Set([
  "88f32cd7205a4f42f637e56db8333e9d8403041eddab71fee3637c939a442aca",
  "7941b9b27a8f00a67cf630f9866960881c4be31941e1f347be8bfbf21ace7733",
  "8652f6cd9088f1fa0566de0bb4916a3991c4be6fe27dc4197562a7bf0cd42e0e",
  "d02a0bd42bb04065a225d55e3bd7bf32d790eb1d05b9f98f6717e9c2b6072f54",
  "4f99080f5ca2aad63fabac63d47a9255eca3ba405ba5c1c525feede48a8bc1c0",
  "beda72b106b728363d8b45b78cb527a9ab8df56695f3e465960879fe00ddc7fb",
  "7027542b1ad0924626b41ebe16f9303e2ade2cb1887ada8d2bdf675f29f868a3",
  "3a1fb2a2fdad893fef49c0e259a4cf6d51a20a6144b0e2cc94ac7e050b39eeaf",
  "e203fa2d1d3bd4dbbb4d499c1a625c3c5d3ad954ca22809c31b4f233db4ca959",
]);
const HIDDEN_IN_CASES = new Set([
  ...HIDDEN,
  "e28ae6b1c3f25ee66ae03ace15104e0e34168ebf0bb3aa98529ca348070e1c80",
  "ce8cf2b15e7cac6d5ef34e9bd3efeaeca8abb776059ad805274debc3aa58e290",
  "0acb4d236dc4d40335f7d6530517e0a24403a93b74f3ab4bcdbc78509682520e",
]);

/** Lowercase words of a text, read whole ("FooBar") and split at camelCase humps ("caseFooBar": "case", "foobar"). */
function words(text: string): Set<string> {
  const whole = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const humps =
    text
      .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set([...whole, ...humps]);
}

const hashes = new Map<string, string>();
const hiddenWords = (text: string, hidden: ReadonlySet<string>): string[] =>
  [...words(text)].filter((word) => {
    const hash = hashes.get(word) ?? createHash("sha256").update(word).digest("hex");
    hashes.set(word, hash);
    return hidden.has(hash);
  });

/** Text files the site, Storybook and the public repo show. docs/_* are private notes (gitignored). */
const PUBLISHED_FOLDERS = ["src", "public", ".storybook", "e2e", "scripts", "docs", ".claude/agents", ".claude/skills"];
const TEXT_FILE = /\.(?:[cm]?[jt]sx?|json|mdx?|html|css|xml|txt|svg|toml|ya?ml)$|(?:^|\/)(?:_headers|_redirects)$/;

function publishedFiles(folder: string): string[] {
  return readdirSync(join(process.cwd(), folder), { withFileTypes: true }).flatMap((entry) => {
    const path = folder + "/" + entry.name;
    if (path.startsWith("docs/_")) return [];
    if (entry.isDirectory()) return publishedFiles(path);
    return TEXT_FILE.test(path) ? [path] : [];
  });
}

describe("confidentiality", () => {
  it("never names a hidden client in a published file", () => {
    const rootFiles = readdirSync(process.cwd(), { withFileTypes: true })
      .filter((entry) => entry.isFile() && TEXT_FILE.test(entry.name) && !entry.name.endsWith(".local.md"))
      .map((entry) => entry.name);
    const files = [...PUBLISHED_FOLDERS.flatMap(publishedFiles), ...rootFiles];
    expect(files.length).toBeGreaterThan(300);
    const hits = files.flatMap((path) =>
      hiddenWords(readFileSync(join(process.cwd(), path), "utf8"), HIDDEN).map((word) => `${path}: ${word}`),
    );
    expect(hits).toEqual([]);
  });

  it("keeps every client out of the case studies, their Work cards and their search copy", () => {
    const text = collectText({ CASES, WORK_CASES, PAGE_DESCRIPTIONS, PAGE_NAMES, VIEW_TITLES, VIEW_PATHS }).join("\n");
    expect(hiddenWords(text, HIDDEN_IN_CASES)).toEqual([]);
  });

  it("ships no case image that no page shows: an unused original, say before redaction, stays reachable by URL", () => {
    const assets = join(process.cwd(), "public", "assets");
    const used = new Set([
      ...CASES.flatMap(caseCards).flatMap((card) => [
        card.asset,
        card.detail ?? card.asset,
        card.darkAsset ?? card.asset,
        // The viewer's sharper copies (useCaseGallery): only beside a screenshot it opens.
        zoomAsset(card.asset),
        zoomAsset(card.darkAsset ?? card.asset),
      ]),
      ...WORK_CASES.flatMap((item) => [item.asset, item.darkAsset ?? item.asset]),
    ]);
    const shipped = readdirSync(join(assets, "cases"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(assets, join(entry.parentPath, entry.name)).split(sep).join("/"));
    expect(shipped.length).toBeGreaterThan(0);
    expect(shipped.filter((path) => !used.has(path))).toEqual([]);
  });
});

describe("sitemap", () => {
  it("lists every page by its path, and nothing else", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>https:\/\/karolina\.kita\.company(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs)).toEqual(new Set(VIEWS.map((view) => VIEW_PATHS[view])));
  });

  it("lists the case studies in the Work page order", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>https:\/\/karolina\.kita\.company(\/work\/[^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(WORK_CASES.map((item) => VIEW_PATHS[item.view]));
  });

  it("gives every page a last-changed date (ISO, never in the future)", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1] ?? "");
    const today = new Date().toISOString().slice(0, 10);
    expect(entries).toHaveLength(VIEWS.length);
    for (const entry of entries) {
      const lastmod = /<lastmod>([^<]*)<\/lastmod>/.exec(entry)?.[1] ?? "";
      expect(lastmod, entry).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lastmod <= today, `${lastmod} is after ${today}`).toBe(true);
    }
  });
});
