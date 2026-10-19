# Architecture

A single-page React app, prerendered to static HTML per page at build time. No backend: content is TypeScript data in the repo.

## Layers

```
src/app        shell: App, routing/, seo/, analytics/, prerender entry
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
- The rules are enforced by ESLint (`no-restricted-imports` per layer, as regular expressions), not only by convention. A slice may import its own files across folders (`#features/about/about.content.ts`), never another slice.
- Imports use subpath aliases from `package.json` ("imports"): `#app/*`, `#features/*`, `#shared/*`, `#test/*`. TypeScript, Vite, Vitest and Node all read the same mapping. Within a folder or below it, imports are relative (`./x.ts`, `./AboutView/AboutView.tsx`); going up or across uses the alias, never `../`.

## Files and folders

One role per file, and one folder per component or domain, so no file grows long (ESLint `max-lines`: 200 lines of code, tests and copy excepted).

```
src/shared/ui/Button/         a component folder
  Button.tsx                  structure and behaviour only
  Button.types.ts             its props and other types
  Button.styles.ts            every Tailwind class it uses (a `styles` object)
  Button.test.tsx             its tests
src/shared/lib/routes/        a domain folder
  routes.constants.ts  routes.types.ts  routes.utils.ts  routes.test.ts
src/features/about/
  index.ts                    the slice's public API
  about.content.ts  about.types.ts
  AboutView/                  the view (a component folder)
  components/FaqItem/ ...     the slice's own components
```

- Components: `PascalCase/PascalCase.tsx`, one component per file. Hooks: `useX.ts` next to what uses them, or in the slice's `hooks/`. Other modules: kebab-case with a role suffix: `*.types.ts`, `*.styles.ts`, `*.constants.ts`, `*.utils.ts`, `*.content.ts`, `*.context.ts`.
- Classes: a `*.styles.ts` exports `styles`, one key per styled element; state-dependent classes are functions (`styles.pill(active)`). Values are composed with [`clsx`](https://github.com/lukeed/clsx); variant sets use [`cva`](https://cva.style) (`button({ variant })`) with the variant names from Figma. Prettier sorts classes inside both. ESLint rejects class strings written into `className` in a component. There is no `tailwind-merge`: it reads the token type styles as colours and drops them.
- Shared class lists (`FOCUS_RING`, `TEXT_LINK`, `BULLET_LIST`, `DOC_LINK`) live in `src/shared/lib/ui/ui.styles.ts`; `EXTERNAL_LINK` (target and rel of a new-tab link) in `ui.constants.ts`.

## Component library (`src/shared/ui`)

Built from the Figma components (Karolina Kita Branding, page Components) and the patterns the pages repeat:

| Figma                                     | Code                                           | Notes                                                         |
| ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Button (Primary, Secondary, Subtle, Link) | `Button`                                       | `as="a"` for links; icon left / right                         |
| Emoji button                              | `IconButton`                                   | square, icon only (image viewer)                              |
| Badge                                     | `Badge`                                        | skill tags, status next to a title                            |
| Card (Big Card)                           | `Card`                                         | `layout` stack / media, `gap`; cards fade up on scroll        |
| Banner (Info, Warning)                    | `Callout`                                      | `tone`                                                        |
| Breadcrumbs                               | `Breadcrumb`                                   |                                                               |
| Avatar                                    | `Avatar`                                       | initials on the avatar glow                                   |
| Toggle                                    | `ThemeToggle` (layout)                         | light / dark                                                  |
| Header, Navigation menu, Footer           | `SiteHeader`, `SiteFooter` (layout)            |                                                               |
| Info Table                                | `InfoPanel`, `MetaMatrix` (features)           | contact and case-study details                                |
| -                                         | `Dialog`                                       | native modal: inert page, Escape, backdrop click, scroll lock |
| -                                         | `Accordion`, `AccordionItem`                   | WAI-ARIA disclosure list (the FAQ)                            |
| -                                         | `PageTitle`, `Section`, `Container`, `Eyebrow` | page structure                                                |
| -                                         | `VisuallyHidden`, `NewTabNote`                 | screen reader text                                            |

Figma's Tabs and Tile have no use on the site yet, so there is no code for them (YAGNI).

- No barrel `index.ts` per component: imports name the file (`#shared/ui/Button/Button.tsx`). Barrels add nothing with explicit extensions and slow the dev server; only a feature's `index.ts` exists, as its public API.

## Routing

- `src/shared/lib/routes/` is the single source: `VIEW` (ids), `VIEW_PATHS` (URLs), `SECTION` (anchors other pages link to), titles and nav items. They are `as const` objects with derived union types, so a wrong id is a type error.
- `src/app/routing/useHistoryRoute.ts` keeps the view in browser history: one entry per view change, scroll position restored on Back and Forward. A new view remounts and fades in; a jump within the same view (Explore Case Studies) only scrolls. On first load it normalises the URL: old hash links (`/#about`, used before 3.0.0) and aliases (`/resume`) become their path; unknown paths become `/`.
- A one-page build with a relative base (`vite build --base ./`, e.g. a claude.ai artifact) has no other paths to load, so `src/main.tsx` turns on hash routing: the path travels in the hash (`#/about`, `#/about#career`). The site itself always uses real paths.
- The URL hash is a **section anchor** (`/about#career`). `Section` (`src/shared/ui/Section/Section.tsx`) gives every section heading a `HeadingAnchor` link that copies the section's address. `src/app/routing/useSectionHash.ts` keeps the hash on the section in view while scrolling, with `replaceState` (no history entries).

## Rendering and SEO

1. `yarn build` runs `vite build` for the browser bundle.
2. `yarn prerender` builds `src/app/prerender.entry.tsx` for the server, then `scripts/prerender.ts` renders every page inside a jsdom window at that page's URL and writes `dist/<path>.html` and `dist/<path>/index.html`, `dist/404.html` (noindex) and `dist/llms.txt`.
3. Each page gets its own title, description, canonical URL, link-preview tags and JSON-LD from `src/app/seo/seo.utils.ts`. Site-wide data (WebSite, Person) stays in `index.html`.
4. In the browser, `src/main.tsx` renders the app over the static HTML. On navigation, `App` updates the same head tags.

Tests keep the pieces in step: every view needs a path, a description (at most 160 characters) and a sitemap entry.

## Images

- `public/assets/site/` (portrait, link-preview PNG) and `public/assets/cases/<case>/` (WebP screenshots, `thumbnail.webp`). Content refers to images by their path under `/assets`.
- `vite.config.ts` provides `virtual:asset-sizes`: the pixel size of every image, read from its PNG or WebP header at build time, so the image viewer can reserve the right space before an image arrives.
- Images load lazily on the page; once the first page is ready, every case study's screenshots preload in the background (`src/shared/media/image-preload/image-preload.utils.ts`), and the open case study goes first.

## Styling

Tailwind v4 with the defaults removed: only KitaBranding token utilities exist (`bg-bg-canvas`, `p-md`, `text-body-md`). Dark mode swaps CSS variables through the `dark` class on `<html>`; there are no `dark:` variants. See [design.md](design.md).

`src/styles/app.css` is the entry: it imports `tokens.css` (the token variables), `print.css`, `theme.css` (tokens → Tailwind theme), `utilities.css` (named utilities and variants), `base.css`, `lightbox.css` (image viewer) and `motion.css` (theme cross-fade, reduced-motion reset). Component classes live in each component's `*.styles.ts`.

## Testing

- Vitest + Testing Library in jsdom; tests sit next to the code and query by role and accessible name.
- `src/app/content-rules.test.ts` checks the copy rules across all features; `src/styles/tokens.test.ts` checks the CSS tokens against the Figma export.
- Behaviour that needs a real browser (layout, focus, scrolling, motion, analytics) is checked with Playwright (`e2e/*.e2e.ts`, helpers in `e2e/helpers/`) and `yarn a11y` (`scripts/a11y-audit.ts`, checks in `scripts/a11y/`).

## Adding a page

1. Add the id to `VIEW`, its path to `VIEW_PATHS` and its title to `VIEW_TITLES` in `src/shared/lib/routes/routes.constants.ts`.
2. Create `src/features/<name>/` with the view folder (`<Name>View/`), `<name>.content.ts`, types, components and an `index.ts`.
3. Map the view in `src/app/App/App.constants.tsx` (`VIEW_RENDERERS`: a missing entry is a type error).
4. Add its description and breadcrumb name in `src/app/seo/seo.content.ts` and its URL in `public/sitemap.xml`.
5. `yarn verify`.
