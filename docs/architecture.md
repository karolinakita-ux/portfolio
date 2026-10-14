# Architecture

A single-page React app, prerendered to static HTML per page at build time. No backend: content is TypeScript data in the repo.

## Layers

```
src/app        shell: App, routing, section hash, SEO, prerender entry
   │  imports features only through their index.ts
   ▼
src/features   work · about · contact · cv · case-studies · image-viewer
   │  never import each other
   ▼
src/shared     ui · layout · media · hooks · lib · content
                 never imports app or features
```

- A **feature** (vertical slice) owns its view, components, hooks, copy (`*.content.ts`), types (`*.types.ts`) and tests. Its `index.ts` is the public API that `src/app` imports.
- **Shared** code is what two or more slices use: UI primitives, the header and footer, image components, hooks, route helpers, profile data.
- The rules are enforced by ESLint (`no-restricted-imports` per layer), not only by convention.
- Imports use subpath aliases from `package.json` ("imports"): `#app/*`, `#features/*`, `#shared/*`, `#test/*`. TypeScript, Vite, Vitest and Node all read the same mapping. Inside a folder, imports are relative (`./x.ts`).
- File names say their role: components `PascalCase.tsx`, hooks `useX.ts`, other modules kebab-case with a suffix: `*.content.ts`, `*.types.ts`, `*.constants.ts`, `*.context.ts`, `*.utils.ts`.

## Routing

- `src/shared/lib/routes.ts` is the single source: `VIEW` (ids), `VIEW_PATHS` (URLs), `SECTION` (anchors other pages link to), titles and nav items. They are `as const` objects with derived union types, so a wrong id is a type error.
- `src/app/useHistoryRoute.ts` keeps the view in browser history: one entry per view change, scroll position restored on Back and Forward. A new view remounts and fades in; a jump within the same view (Explore Case Studies) only scrolls. On first load it normalises the URL: old hash links (`/#about`, used before 3.0.0) and aliases (`/resume`) become their path; unknown paths become `/`.
- A one-page build with a relative base (`vite build --base ./`, e.g. a claude.ai artifact) has no other paths to load, so `src/main.tsx` turns on hash routing: the path travels in the hash (`#/about`, `#/about#career`). The site itself always uses real paths.
- The URL hash is a **section anchor** (`/about#career`). `Section` (`src/shared/ui/layout.tsx`) gives every section heading a `HeadingAnchor` link that copies the section's address. `src/app/useSectionHash.ts` keeps the hash on the section in view while scrolling, with `replaceState` (no history entries).

## Rendering and SEO

1. `yarn build` runs `vite build` for the browser bundle.
2. `yarn prerender` builds `src/app/prerender.entry.tsx` for the server, then `scripts/prerender.ts` renders every page inside a jsdom window at that page's URL and writes `dist/<path>.html` and `dist/<path>/index.html`, `dist/404.html` (noindex) and `dist/llms.txt`.
3. Each page gets its own title, description, canonical URL, link-preview tags and JSON-LD from `src/app/seo.utils.ts`. Site-wide data (WebSite, Person) stays in `index.html`.
4. In the browser, `src/main.tsx` renders the app over the static HTML. On navigation, `App` updates the same head tags.

Tests keep the pieces in step: every view needs a path, a description (at most 160 characters) and a sitemap entry.

## Images

- `public/assets/site/` (portrait, link-preview PNG) and `public/assets/cases/<case>/` (WebP screenshots, `thumbnail.webp`). Content refers to images by their path under `/assets`.
- `vite.config.ts` provides `virtual:asset-sizes`: the pixel size of every image, read from its PNG or WebP header at build time, so the image viewer can reserve the right space before an image arrives.
- Images load lazily on the page; once the first page is ready, every case study's screenshots preload in the background (`src/shared/media/image-preload.ts`), and the open case study goes first.

## Styling

Tailwind v4 with the defaults removed: only KitaBranding token utilities exist (`bg-bg-canvas`, `p-md`, `text-body-md`). Dark mode swaps CSS variables through the `dark` class on `<html>`; there are no `dark:` variants. See [design.md](design.md).

## Testing

- Vitest + Testing Library in jsdom; tests sit next to the code and query by role and accessible name.
- `src/app/content-rules.test.ts` checks the copy rules across all features; `src/styles/tokens.test.ts` checks the CSS tokens against the Figma export.
- Behaviour that needs a real browser (layout, focus, scrolling) is checked with Playwright scripts and `yarn a11y`.

## Adding a page

1. Add the id to `VIEW`, its path to `VIEW_PATHS` and its title in `routes.ts`.
2. Create `src/features/<name>/` with the view, `<name>.content.ts`, types, tests and an `index.ts`.
3. Map the view in `App.tsx` (`VIEW_RENDERERS`: a missing entry is a type error).
4. Add its description and breadcrumb name in `src/app/seo.content.ts` and its URL in `public/sitemap.xml`.
5. `yarn verify`.
