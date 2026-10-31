import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import type { HeadTag } from "./seo.types.ts";

export const SITE_URL = "https://karolina.kita.company";

/** JSON-LD ids of the site-wide Person and WebSite (declared in index.html). */
export const PERSON_ID = SITE_URL + "/#person";
export const WEBSITE_ID = SITE_URL + "/#website";

/**
 * Pages about Karolina herself: Google reads them as profile pages. Not the Work home page, which is mostly case
 * studies: Google's ProfilePage guide names a home page with much else on it as an example of what is not one.
 */
export const PROFILE_PAGES: ReadonlySet<View> = new Set([VIEW.about, VIEW.cv]);

/** The CV as a PDF (public/, made by `yarn cv-pdf`), listed in llms.txt next to the CV page. */
export const CV_PDF_URL = SITE_URL + "/karolina-kita-cv.pdf";

/**
 * Pages llms.txt lists last, under "## Optional": llmstxt.org's heading for links a reader with little room can
 * skip. Every other page outside Work and the case studies is listed under "About Karolina" (llmsTxt()).
 */
export const LLMS_OPTIONAL: readonly View[] = [VIEW.privacy, VIEW.accessibility];

/**
 * The head tags beside <title> that follow the page: scripts/prerender.ts writes them into each page's HTML
 * (static-head.utils.ts) and useDocumentHead updates them on every navigation, from this one list, so the
 * prerendered pages and the app cannot drift apart. The robots tag is not here: only 404.html says noindex, and
 * Google advises against changing robots with JavaScript.
 */
export const HEAD_TAGS: readonly HeadTag[] = [
  { tag: "meta", key: ["name", "description"], attribute: "content", field: "description" },
  { tag: "link", key: ["rel", "canonical"], attribute: "href", field: "url" },
  { tag: "meta", key: ["property", "og:url"], attribute: "content", field: "url" },
  { tag: "meta", key: ["property", "og:title"], attribute: "content", field: "title" },
  { tag: "meta", key: ["property", "og:description"], attribute: "content", field: "description" },
  { tag: "meta", key: ["name", "twitter:title"], attribute: "content", field: "title" },
  { tag: "meta", key: ["name", "twitter:description"], attribute: "content", field: "description" },
];
