import { PRERENDERED_VIEW_ATTRIBUTE } from "#app/hydration/hydration.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { HEAD_TAGS } from "./seo.constants.ts";
import type { HeadTag, PageHead } from "./seo.types.ts";
import { headTagSelector } from "./seo.utils.ts";

/**
 * Writes a page's head and content into the built index.html, for scripts/prerender.ts (through
 * prerender.entry.tsx; not part of the browser bundle). Plain string replacements, so the rest of the template
 * stays byte for byte. Every replacement is a function: a "$1", "$&" or "$'" in a title, description or page
 * would otherwise be read as a replacement pattern and change the HTML.
 */

type Replacer = (match: string, ...groups: string[]) => string;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&#34;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replaces one pattern; a template change that breaks a pattern fails the build instead of shipping stale tags. */
function replaceOnce(html: string, pattern: RegExp, replacer: Replacer, what: string): string {
  if (!pattern.test(html)) throw new Error(`prerender: ${what} not found in dist/index.html`);
  return html.replace(pattern, replacer);
}

/** A head tag in index.html, with its value between the two groups: (<meta property="og:title" content=")…("). */
const tagPattern = ({ tag, key: [name, value], attribute }: HeadTag): RegExp =>
  new RegExp(`(<${tag}\\s+${name}="${escapeRegExp(value)}"\\s+${attribute}=")[^"]*(")`);

const keepEnds =
  (value: string): Replacer =>
  (_match, open = "", close = "") =>
    open + value + close;

/** The template with the page's title, head tags (HEAD_TAGS) and structured data; `noindex` for 404.html. */
export function applyHead(template: string, head: PageHead, { noindex = false } = {}): string {
  const title = escapeHtml(head.title);
  let html = replaceOnce(template, /<title>[^<]*<\/title>/, () => `<title>${title}</title>`, "<title>");
  for (const tag of HEAD_TAGS) {
    html = replaceOnce(html, tagPattern(tag), keepEnds(escapeHtml(head[tag.field])), headTagSelector(tag));
  }
  if (noindex) {
    html = replaceOnce(html, /(<meta name="robots" content=")[^"]*(")/, keepEnds("noindex, follow"), "robots");
  }
  // "<" inside JSON-LD would end the script element early.
  const jsonLd = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
  // data-page: useDocumentHead replaces this block's JSON on client-side navigation.
  const script = `    <script type="application/ld+json" data-page>${jsonLd}</script>\n  </head>`;
  return replaceOnce(html, /<\/head>/, () => script, "</head>");
}

/**
 * The page with the app's HTML for `view` in its root element, which names the view (PRERENDERED_VIEW_ATTRIBUTE):
 * src/main.tsx adopts the HTML only where the address opens the same view.
 */
export const withRootContent = (page: string, appHtml: string, view: View): string =>
  replaceOnce(
    page,
    /<div id="root"><\/div>/,
    () => `<div id="root" ${PRERENDERED_VIEW_ATTRIBUTE}="${view}">${appHtml}</div>`,
    '<div id="root">',
  );
