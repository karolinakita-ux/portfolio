/**
 * Writes static HTML for every page after `vite build` (run by `yarn build`):
 *   dist/index.html, dist/about.html + dist/about/index.html, dist/work/project-planning.html + …,
 *   dist/404.html (Work, noindex) and dist/llms.txt.
 * Search engines, link previews and AI agents read the full content without JavaScript;
 * in the browser, src/main.tsx renders the app over it.
 *
 * The app reads window.location, localStorage and matchMedia on its first render, so each
 * page renders inside a jsdom window at that page's URL.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const DIST = resolve("dist");
const SSR_ENTRY = resolve("node_modules/.tmp/ssr/prerender.entry.js");

interface PageHead {
  title: string;
  description: string;
  url: string;
  jsonLd: Record<string, unknown>;
}
interface PrerenderModule {
  VIEWS: readonly string[];
  VIEW_PATHS: Readonly<Record<string, string>>;
  headFor: (view: string) => PageHead;
  llmsTxt: () => string;
  renderPage: () => string;
}

const BROWSER_GLOBALS = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  "HTMLElement",
  "Element",
  "Node",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
] as const;

/** Points the browser globals at a fresh jsdom window for `url`. */
function installWindow(url: string, html: string): void {
  const { window } = new JSDOM(html, { url, pretendToBeVisual: true });
  const media = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
  Object.defineProperty(window, "matchMedia", { value: media, configurable: true });
  for (const key of BROWSER_GLOBALS) {
    const value: unknown = key === "window" ? window : window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  Object.defineProperty(globalThis, "matchMedia", { value: media, configurable: true, writable: true });
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Replaces one pattern; a template change that breaks a pattern fails the build instead of shipping stale tags. */
function replaceOnce(html: string, pattern: RegExp, replacement: string, what: string): string {
  if (!pattern.test(html)) throw new Error(`prerender: ${what} not found in dist/index.html`);
  return html.replace(pattern, replacement);
}

function applyHead(template: string, head: PageHead, { noindex = false } = {}): string {
  const title = escapeHtml(head.title);
  const description = escapeHtml(head.description);
  let html = template;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, "<title>");
  html = replaceOnce(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`, "description");
  html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${head.url}$2`, "canonical");
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${head.url}$2`, "og:url");
  html = replaceOnce(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`, "og:title");
  html = replaceOnce(
    html,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${description}$2`,
    "og:description",
  );
  html = replaceOnce(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`, "twitter:title");
  html = replaceOnce(
    html,
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${description}$2`,
    "twitter:description",
  );
  if (noindex) {
    html = replaceOnce(html, /(<meta name="robots" content=")[^"]*(")/, "$1noindex, follow$2", "robots");
  }
  // "<" inside JSON-LD would end the script element early.
  const jsonLd = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
  // data-page: App replaces this block's JSON on client-side navigation.
  return html.replace("</head>", `    <script type="application/ld+json" data-page>${jsonLd}</script>\n  </head>`);
}

function withContent(page: string, appHtml: string): string {
  return replaceOnce(page, /<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`, '<div id="root">');
}

async function write(file: string, content: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const template = await readFile(join(DIST, "index.html"), "utf8");
installWindow("https://karolina.kita.company/", template);
const ssr = (await import(pathToFileURL(SSR_ENTRY).href)) as PrerenderModule;

for (const view of ssr.VIEWS) {
  const path = ssr.VIEW_PATHS[view];
  if (!path) throw new Error(`prerender: no path for ${view}`);
  const head = ssr.headFor(view);
  installWindow(head.url, template);
  const page = withContent(applyHead(template, head), ssr.renderPage());
  if (path === "/") {
    await write(join(DIST, "index.html"), page);
  } else {
    // /about is served from about.html or about/index.html, depending on the host's rules.
    await write(join(DIST, path.slice(1) + ".html"), page);
    await write(join(DIST, path.slice(1), "index.html"), page);
  }
  console.log(`prerendered ${path}`);
}

// Unknown paths: Netlify serves 404.html with status 404; the app then shows Work at /.
const workView = ssr.VIEWS[0] ?? "work";
installWindow("https://karolina.kita.company/", template);
await write(
  join(DIST, "404.html"),
  withContent(applyHead(template, ssr.headFor(workView), { noindex: true }), ssr.renderPage()),
);
await write(join(DIST, "llms.txt"), ssr.llmsTxt());
console.log("prerendered 404.html and llms.txt");
