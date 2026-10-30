import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { PAGE_DESCRIPTIONS, PAGE_NAMES } from "#app/seo/seo.content.ts";
import { ABOUT_INTRO, FAQ, MILESTONES, PRINCIPLES } from "#features/about/about.content.ts";
import { ACCESSIBILITY } from "#features/accessibility/accessibility.content.tsx";
import type { AnyCase, ShowcaseCard } from "#features/case-studies/case-studies.types.ts";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { CONTACT } from "#features/contact/contact.content.ts";
import { CV, CV_PAGE } from "#features/cv/cv.content.ts";
import { formatMonthYear } from "#features/cv/dates/dates.utils.ts";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { PROCESS_BANNER, TESTIMONIALS, WORK_CASES, WORK_INTRO } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { linkRef } from "#shared/lib/analytics/payload.utils.ts";
import { VIEW, VIEW_PATHS, VIEW_TITLES, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { isCaseView, isView } from "#shared/lib/routes/routes.utils.ts";
import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { Strong } from "#shared/ui/Strong/Strong.tsx";

/** Image path under /assets: lowercase kebab-case folders and file name, web image formats. */
const ASSET_PATH = /^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(png|jpe?g|webp)$/;

/**
 * Content rules for the portfolio copy, so they hold for every future edit:
 *   - Short hyphens with spaces ("word - word", "2019 - 2026"), never en or em dashes.
 *   - The CV is plain text for applicant tracking systems: no curly quotes either, ISO dates.
 *   - H1 headings never end with a trailing period.
 *   - Every case-study bullet opens with a bold lead-in term and a colon.
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
  WORK_CASES,
  WORK_INTRO,
  CASES,
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

  it("shares the contact details with the profile, and marks the PDF's portfolio link for the UTM report only", () => {
    expect(CV.header.name).toBe(PROFILE.name);
    expect(CV.header.email).toBe(PROFILE.email);
    expect(CV.header.linkedin.href).toBe(PROFILE.linkedinUrl);
    expect(CV.header.site.pdfHref).toBe("https://" + CV.header.site.label + "/?utm_medium=cv-pdf");
    // Not a link tag: it would replace the session's ref (the company a /cv?ref=acme link brought) with its own.
    expect(linkRef(new URL(CV.header.site.pdfHref).search)).toBeNull();
    expect(CV.footer).toBe(PROFILE.name + " · " + PROFILE.role);
  });

  it("gives the recruitment consent in English and in Polish, each with the email address once", () => {
    const { en, pl } = CV.consent;
    for (const text of [en, pl]) expect(text.split("{email}")).toHaveLength(2);
    expect(en).toMatch(/^I consent to the processing of my personal data/);
    expect(en).toContain("GDPR (Regulation (EU) 2016/679)");
    expect(en).toContain("future recruitment processes");
    expect(en).toMatch(/withdraw my consent at any time/);
    expect(pl).toMatch(/^Wyrażam zgodę na przetwarzanie moich danych osobowych/);
    expect(pl).toContain("RODO (rozporządzenie (UE) 2016/679)");
    expect(pl).toContain("przyszłych procesów rekrutacji");
    expect(pl).toMatch(/wycofać w każdej chwili/);
    // The same retention period in both languages.
    expect(/\d+ months/.exec(en)?.[0]).toBe("12 months");
    expect(/\d+ miesięcy/.exec(pl)?.[0]).toBe("12 miesięcy");
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
