import { PROFILE } from "#shared/content/profile.ts";
import { titleForView, VIEW, VIEW_PATHS, VIEWS, type View } from "#shared/lib/routes.ts";

import { PAGE_DESCRIPTIONS, PAGE_NAMES } from "./seo.content.ts";

/**
 * Head data per page, used twice: by scripts/prerender.ts to write each page's static HTML
 * (what search engines, link previews and AI agents read), and by App on every navigation.
 * Site-wide structured data (WebSite, Person) stays in index.html; this adds the page itself.
 */
export const SITE_URL = "https://karolina.kita.company";

const PERSON_ID = SITE_URL + "/#person";
const WEBSITE_ID = SITE_URL + "/#website";

/** Absolute URL of a page ("https://karolina.kita.company/about"). */
export const absoluteUrl = (view: View): string => SITE_URL + VIEW_PATHS[view];

const isCaseStudy = (view: View): boolean => view.startsWith("case-");

/** Pages about Karolina herself: Google reads them as profile pages. */
const PROFILE_PAGES: ReadonlySet<View> = new Set([VIEW.work, VIEW.about, VIEW.cv]);

export interface PageHead {
  title: string;
  description: string;
  url: string;
  /** One JSON-LD document: the page, its breadcrumb and, for case studies, the work itself. */
  jsonLd: Record<string, unknown>;
}

export function headFor(view: View): PageHead {
  const title = titleForView(view);
  const description = PAGE_DESCRIPTIONS[view];
  const url = absoluteUrl(view);
  const trail = view === VIEW.work ? [VIEW.work] : [VIEW.work, view];

  const page = {
    "@type": PROFILE_PAGES.has(view) ? "ProfilePage" : "WebPage",
    "@id": url + "#webpage",
    url,
    name: title,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    ...(PROFILE_PAGES.has(view) ? { mainEntity: { "@id": PERSON_ID } } : {}),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: trail.map((step, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: PAGE_NAMES[step],
        item: absoluteUrl(step),
      })),
    },
  };
  const caseStudy = isCaseStudy(view)
    ? {
        "@type": "CreativeWork",
        "@id": url + "#case-study",
        name: PAGE_NAMES[view],
        description,
        url,
        genre: "UX case study",
        inLanguage: "en",
        author: { "@id": PERSON_ID },
        mainEntityOfPage: { "@id": url + "#webpage" },
      }
    : null;

  return {
    title,
    description,
    url,
    jsonLd: { "@context": "https://schema.org", "@graph": caseStudy ? [page, caseStudy] : [page] },
  };
}

/** /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants and agents. */
export function llmsTxt(): string {
  const line = (view: View) => `- [${PAGE_NAMES[view]}](${absoluteUrl(view)}): ${PAGE_DESCRIPTIONS[view]}`;
  const cases = VIEWS.filter(isCaseStudy);
  const pages = [VIEW.about, VIEW.cv, VIEW.contact];
  return [
    `# ${PROFILE.name} - ${PROFILE.role}`,
    "",
    `> ${PAGE_DESCRIPTIONS[VIEW.work]} Open to new opportunities.`,
    "",
    "Every page below is plain HTML: no login, no JavaScript needed to read it.",
    "",
    "## Case studies",
    "",
    ...cases.map(line),
    "",
    "## About Karolina",
    "",
    line(VIEW.work),
    ...pages.map(line),
    "",
    "## Contact",
    "",
    `- Email: ${PROFILE.email}`,
    `- LinkedIn: ${PROFILE.linkedinUrl}`,
    "",
  ].join("\n");
}
