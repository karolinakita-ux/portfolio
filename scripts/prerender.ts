/**
 * Writes static HTML for every page after `vite build` (run by `yarn build`):
 *   dist/index.html, dist/about.html + dist/about/index.html, dist/work/automotive.html + …,
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
  /** Head tags and structured data into the template (src/app/seo/static-head.utils.ts). */
  applyHead: (template: string, head: PageHead, options?: { noindex?: boolean }) => string;
  withRootContent: (page: string, appHtml: string) => string;
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

/** The site icons (index.html). Search engines read each page's own head, so every page must keep them. */
const ICON_LINK = /<link rel="(?:icon|apple-touch-icon)"[^>]*>/g;

function keepsIcons(page: string, iconLinks: readonly string[], what: string): string {
  const lost = iconLinks.filter((link) => !page.includes(link));
  if (lost.length) throw new Error(`prerender: ${what} lost its icon links: ${lost.join(" ")}`);
  return page;
}

async function write(file: string, content: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const template = await readFile(join(DIST, "index.html"), "utf8");
const iconLinks = template.match(ICON_LINK) ?? [];
if (iconLinks.length === 0) throw new Error("prerender: no icon <link> in dist/index.html");
installWindow("https://karolina.kita.company/", template);
const ssr = (await import(pathToFileURL(SSR_ENTRY).href)) as PrerenderModule;

for (const view of ssr.VIEWS) {
  const path = ssr.VIEW_PATHS[view];
  if (!path) throw new Error(`prerender: no path for ${view}`);
  const head = ssr.headFor(view);
  installWindow(head.url, template);
  const page = keepsIcons(ssr.withRootContent(ssr.applyHead(template, head), ssr.renderPage()), iconLinks, path);
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
const notFound = ssr.withRootContent(
  ssr.applyHead(template, ssr.headFor(workView), { noindex: true }),
  ssr.renderPage(),
);
await write(join(DIST, "404.html"), keepsIcons(notFound, iconLinks, "404.html"));
await write(join(DIST, "llms.txt"), ssr.llmsTxt());
console.log("prerendered 404.html and llms.txt");
