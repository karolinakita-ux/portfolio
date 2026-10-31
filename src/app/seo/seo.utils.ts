import { WORK_CASES } from "#features/work/index.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { pageCount } from "#shared/content/profile.utils.ts";
import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { isCaseView, titleForView } from "#shared/lib/routes/routes.utils.ts";
import { HOME_CRUMB, WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";

import { CV_PDF_URL, LLMS_OPTIONAL, PERSON_ID, PROFILE_PAGES, SITE_URL, WEBSITE_ID } from "./seo.constants.ts";
import { CASE_PERIODS, PAGE_DESCRIPTIONS, PAGE_NAMES } from "./seo.content.ts";
import type { HeadTag, PageHead } from "./seo.types.ts";

/**
 * Head data per page, used twice: by scripts/prerender.ts to write each page's static HTML
 * (what search engines, link previews and AI agents read), and by App on every navigation.
 * Site-wide structured data (WebSite, Person) stays in index.html; this adds the page itself.
 */
/** Absolute URL of a page ("https://karolina.kita.company/about"). */
export const absoluteUrl = (view: View): string => SITE_URL + VIEW_PATHS[view];

/** The CSS selector of a head tag (meta[property="og:title"]). */
export const headTagSelector = ({ tag, key: [name, value] }: HeadTag): string => `${tag}[${name}="${value}"]`;

/**
 * The page's breadcrumb with the labels visitors see on it (Google: ListItem.name is "the title of the breadcrumb
 * displayed for the user"): Work and a case study's shortTitle (CASE_NAMES), or Home and the page's name. None on
 * Work, the home page, which shows none: Google asks for at least two items.
 */
function breadcrumb(view: View): Record<string, unknown> | null {
  if (view === VIEW.work) return null;
  const steps = [
    { name: isCaseView(view) ? WORK_CRUMB.label : HOME_CRUMB.label, item: absoluteUrl(VIEW.work) },
    { name: isCaseView(view) ? CASE_NAMES[view].shortTitle : PAGE_NAMES[view], item: absoluteUrl(view) },
  ];
  return {
    "@type": "BreadcrumbList",
    itemListElement: steps.map((step, index) => ({ "@type": "ListItem", position: index + 1, ...step })),
  };
}

/** What the page is: Work, the home page, lists Karolina's case studies; About and the CV are her profile. */
function pageKind(view: View): [type: string, subject: Record<string, unknown>] {
  if (view === VIEW.work) return ["CollectionPage", { about: { "@id": PERSON_ID } }];
  if (PROFILE_PAGES.has(view)) return ["ProfilePage", { mainEntity: { "@id": PERSON_ID } }];
  return ["WebPage", {}];
}

/** A case study as Karolina's work: named as its Work card, with the card's (Light) picture and its period. */
function caseStudy(view: View, url: string, description: string): Record<string, unknown> {
  const card = WORK_CASES.find((item) => item.view === view);
  const period = CASE_PERIODS[view];
  return {
    "@type": "CreativeWork",
    "@id": url + "#case-study",
    name: PAGE_NAMES[view],
    description,
    url,
    ...(card ? { image: SITE_URL + "/assets/" + card.asset } : {}),
    ...(period ? { temporalCoverage: period } : {}),
    genre: "UX case study",
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    mainEntityOfPage: { "@id": url + "#webpage" },
  };
}

export function headFor(view: View): PageHead {
  const title = titleForView(view);
  const description = PAGE_DESCRIPTIONS[view];
  const url = absoluteUrl(view);
  const trail = breadcrumb(view);
  const [type, subject] = pageKind(view);

  const page = {
    "@type": type,
    "@id": url + "#webpage",
    url,
    name: title,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    ...subject,
    ...(trail ? { breadcrumb: trail } : {}),
  };
  const graph = isCaseView(view) ? [page, caseStudy(view, url, description)] : [page];

  return { title, description, url, jsonLd: { "@context": "https://schema.org", "@graph": graph } };
}

/**
 * /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants and agents. Work holds the Work page and
 * its case studies in the page's order, as the menu and the breadcrumbs do; About Karolina the pages about her.
 */
export function llmsTxt(): string {
  const line = (view: View) => `- [${PAGE_NAMES[view]}](${absoluteUrl(view)}): ${PAGE_DESCRIPTIONS[view]}`;
  const work: readonly View[] = [VIEW.work, ...WORK_CASES.map((item) => item.view)];
  const pages = VIEWS.filter((view) => !work.includes(view) && !LLMS_OPTIONAL.includes(view));
  return [
    `# ${PROFILE.name} - ${PROFILE.role}`,
    "",
    `> ${PAGE_DESCRIPTIONS[VIEW.work]} Open to new opportunities.`,
    "",
    "Every page below is plain HTML: no login, no JavaScript needed to read it.",
    "",
    "## Work",
    "",
    ...work.map(line),
    "",
    "## About Karolina",
    "",
    ...pages.map(line),
    "",
    "## Contact",
    "",
    `- Email: ${PROFILE.email}`,
    `- LinkedIn: ${PROFILE.linkedinUrl}`,
    `- CV (PDF, ${pageCount(PROFILE.cvPdfPages)}): ${CV_PDF_URL}`,
    `- GitHub: ${PROFILE.githubProfileUrl}`,
    "",
    "## Optional",
    "",
    ...LLMS_OPTIONAL.map(line),
    "",
  ].join("\n");
}
