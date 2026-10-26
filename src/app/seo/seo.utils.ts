import { PROFILE } from "#shared/content/profile.ts";
import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { isCaseView, titleForView } from "#shared/lib/routes/routes.utils.ts";

import { PERSON_ID, PROFILE_PAGES, SITE_URL, WEBSITE_ID } from "./seo.constants.ts";
import { HOME_NAME, PAGE_DESCRIPTIONS, PAGE_NAMES } from "./seo.content.ts";
import type { PageHead } from "./seo.types.ts";

/**
 * Head data per page, used twice: by scripts/prerender.ts to write each page's static HTML
 * (what search engines, link previews and AI agents read), and by App on every navigation.
 * Site-wide structured data (WebSite, Person) stays in index.html; this adds the page itself.
 */
/** Absolute URL of a page ("https://karolina.kita.company/about"). */
export const absoluteUrl = (view: View): string => SITE_URL + VIEW_PATHS[view];

export function headFor(view: View): PageHead {
  const title = titleForView(view);
  const description = PAGE_DESCRIPTIONS[view];
  const url = absoluteUrl(view);
  const trail = view === VIEW.work ? [VIEW.work] : [VIEW.work, view];
  // The home page is the Work page: case studies sit under Work, the other pages under Home.
  const stepName = (step: View) => (step === view || isCaseView(view) ? PAGE_NAMES[step] : HOME_NAME);

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
        name: stepName(step),
        item: absoluteUrl(step),
      })),
    },
  };
  const caseStudy = isCaseView(view)
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
  const cases = VIEWS.filter(isCaseView);
  const pages = [VIEW.about, VIEW.contact, VIEW.privacy, VIEW.accessibility];
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
    `- GitHub: ${PROFILE.githubProfileUrl}`,
    "",
  ].join("\n");
}
