# Architecture

A single-page React app, prerendered to static HTML per page at build time. No backend: content is TypeScript data in the repo.

## Layers

```
src/app        shell: App, routing/, seo/, analytics/, prerender entry
   │  imports features only through their index.ts
   ▼
src/features   work · about · contact · case-studies · image-viewer · privacy
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
- Shared class lists (`FOCUS_RING`, `TEXT_LINK`, `BUTTON_HEIGHT`, `BULLET_LIST`) live in `src/shared/lib/ui/ui.styles.ts`; `EXTERNAL_LINK` (target and rel of a new-tab link) in `ui.constants.ts`.
- A row of text links that can wrap (the Behind the Design banner) is spaced like a row of buttons: each link gets `BUTTON_HEIGHT` (a bordered Button's height) and the row `gap-y-sm`, the gap between buttons.

## Component library (`src/shared/ui`)

Built from the Figma components (Karolina Kita Branding, page Components) and the patterns the pages repeat:

| Figma                                     | Code                                           | Notes                                                         |
| ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Button (Primary, Secondary, Subtle, Link) | `Button`                                       | `as="a"` for links; icon left / right                         |
| Emoji button                              | `IconButton`                                   | square, icon only (image viewer)                              |
| Badge                                     | `Badge`                                        | skill tags, status next to a title                            |
| Card (Big Card)                           | `Card`                                         | `layout` stack / media, `gap`; cards fade up on scroll        |
| Banner (Info, Warning)                    | `Callout`                                      | `tone`                                                        |
| Breadcrumbs                               | `Breadcrumb`                                   | `HOME_CRUMB` on pages outside Work, `WORK_CRUMB` on cases     |
| Avatar                                    | `Avatar`                                       | initials on the avatar glow                                   |
| Toggle                                    | `ThemeToggle` (layout)                         | light / dark                                                  |
| Header, Navigation menu, Footer           | `SiteHeader`, `SiteFooter` (layout)            |                                                               |
| Info Table                                | `InfoTable`, `InfoTableCell`                   | label/value cells (contact, privacy); `MetaMatrix` in cases   |
| -                                         | `Dialog`                                       | native modal: inert page, Escape, backdrop click, scroll lock |
| -                                         | `Accordion`, `AccordionItem`                   | WAI-ARIA disclosure list (the FAQ)                            |
| -                                         | `PageTitle`, `Section`, `Container`, `Eyebrow` | page structure                                                |
| -                                         | `VisuallyHidden`, `NewTabNote`                 | screen reader text                                            |
| -                                         | `TextLink`, `ViewLink`                         | inline link (`external` opens a new tab); link to a view      |
| -                                         | `HeadingAnchor`, `CopyEmail`                   | copy a section's address; copy the email address              |
| -                                         | `Lang`, `Strong`, `lead`, `Swatch`             | inline text helpers (Storybook: Inline text)                  |
| -                                         | `icons`                                        | the icon set (Storybook: Foundations/Icons)                   |

Figma's Tabs and Tile have no use on the site yet, so there is no code for them (YAGNI).

- No barrel `index.ts` per component: imports name the file (`#shared/ui/Button/Button.tsx`). Barrels add nothing with explicit extensions and slow the dev server; only a feature's `index.ts` exists, as its public API.

### Storybook

Every shared component (`shared/ui`, `shared/layout`, `shared/media`) and the consent box have a story next to them (`Button/Button.stories.tsx`), with the variants from Figma, real copy and a light/dark toolbar. `yarn storybook` opens it locally on port 6006.

- Welcome page: `.storybook/Welcome.mdx` opens first. It says what the library is, how it comes from the Figma design system, what each sidebar group holds and how to use the toolbar and the Accessibility panel. It sits outside `src` so Tailwind does not scan its prose for class names. The sidebar order is set in `preview.tsx` (`storySort`): Welcome, Foundations, UI, Layout, Media, Patterns.
- Tests: `src/test/stories.test.tsx` runs every story in Vitest with the Storybook settings (`composeStories`): it renders, runs the story's `play` checks (clicks, `aria-expanded`, callbacks), then axe for WCAG 2.2 A/AA. It also fails when a component folder has no story. Colour contrast and page-level rules stay with `yarn a11y`, which sees real layout.
- Published: Netlify's production build (main) runs `yarn build-storybook` into `dist/storybook`, served at `/storybook/`. It is a separate build, so the site's pages never load its code; `X-Robots-Tag: noindex, nofollow` (`public/_headers`) and a robots meta keep it out of search. The Work page links it from the hero ("View Components in Storybook") and the Behind the Design banner ("Explore the Storybook Library"), both from `PROFILE.storybookUrl`: an absolute URL in builds, because only production builds Storybook; on `yarn dev` it points to the local `yarn storybook` (port 6006), so unreleased stories show there.
- Deploys: every build renames the story files and Netlify removes the old ones, so a Storybook tab opened before a deploy would fail with "Failed to fetch dynamically imported module". `.storybook/preview-head.html` reloads the preview once on `vite:preloadError` (at most once in 10 s). The site itself is one bundle with no lazy chunks, so it does not have this problem.
- Static files: only `public/assets/cases/project-planning` is copied (the screenshots the media stories show), not the site's `public/` with its headers and sitemap.

## Routing

- `src/shared/lib/routes/` is the single source: `VIEW` (ids), `VIEW_PATHS` (URLs), `SECTION` (anchors other pages link to), titles and nav items. They are `as const` objects with derived union types, so a wrong id is a type error.
- `src/app/routing/useHistoryRoute.ts` keeps the view in browser history: one entry per view change, scroll position restored on Back and Forward. Positions are kept in memory by entry id (`kbId`) and written into the history only when leaving a page (a navigation, `pagehide`), never while scrolling: in-app browsers (Messenger, Instagram, LinkedIn) flash their loading bar on every history write. A new view remounts and fades in; a jump within the same view (Explore Case Studies) only scrolls. On first load it normalises the URL: old hash links (`/#about`, used before 3.0.0) and aliases (`/resume`, and `/cv`: the CV page, removed in 4.0.0, now opens About) become their path; unknown paths become `/`.
- A one-page build with a relative base (`vite build --base ./`, e.g. a claude.ai artifact) has no other paths to load, so `src/main.tsx` turns on hash routing: the path travels in the hash (`#/about`, `#/about#career`). The site itself always uses real paths.
- The URL hash is a **section anchor** (`/about#career`). `Section` (`src/shared/ui/Section/Section.tsx`) gives every section heading a `HeadingAnchor` link that copies the section's address. `src/app/routing/useSectionHash.ts` keeps the hash on the section in view while scrolling, with `replaceState` (no history entries). Not in in-app browsers (`IN_APP_BROWSER`, by user agent), for the loading-bar reason above; `e2e/history.e2e.ts` checks both in three browsers.

## Rendering and SEO

1. `yarn build` runs `vite build` for the browser bundle.
2. `yarn prerender` builds `src/app/prerender.entry.tsx` for the server, then `scripts/prerender.ts` renders every page inside a jsdom window at that page's URL and writes `dist/<path>.html` and `dist/<path>/index.html`, `dist/404.html` (noindex) and `dist/llms.txt`. A page that lost one of the template's icon links (`<link rel="icon">`, `apple-touch-icon`) fails the build: search engines read each page's own head.
3. Each page gets its own title, description, canonical URL, link-preview tags and JSON-LD from `src/app/seo/seo.utils.ts`. Site-wide data (WebSite, Person) stays in `index.html`.
4. In the browser, `src/main.tsx` renders the app over the static HTML. On navigation, `App` updates the same head tags.

Tests keep the pieces in step: every view needs a path, a description (at most 160 characters) and a sitemap entry.

Google Search Console verifies the site's owner with `public/googlecf978c6093e1d8a5.html` (the HTML file method). Google checks it again from time to time, so the file stays as issued: `src/app/seo/site-verification.test.ts` fails if it is removed or edited, and `_headers` marks it `noindex`. The sitemap (`/sitemap.xml`) is submitted there.

## Visitor statistics

Umami Cloud counts visits, opt-in only. Its script reads the screen size and language, so it needs consent under ePrivacy Art. 5(3) and Art. 399 of the Polish Prawo komunikacji elektronicznej, cookies or not. What is sent, why, and the naming rules for new events: [analytics.md](analytics.md) (the tracking plan).

- `src/shared/lib/analytics/statistics-consent.utils.ts` holds the choice (`kb-statistics` in localStorage, `STORED_CHOICE`: "on-3" or "off") and loads the script only after a yes. A yes is stored with a number: when the statistics start collecting something new, the number goes up and earlier yeses are asked again (a plain "on" is a yes from before 3.14.0, "on-2" one from before 4.1.0). A no stays a no. With Do Not Track or Global Privacy Control on, nobody is asked and nothing loads. Only the live host counts (`UMAMI.host`); dev, local previews, Netlify's own addresses (`*.netlify.app`) and the artifact never load it.
- The privacy slice (`src/features/privacy/`) asks: the consent box at the bottom of every page until the visitor decides (two equal buttons, a link to Umami and to the details), and the switch on /privacy to change the choice later. On `yarn dev` the box shows on every load to check its design and loads nothing; automated browsers (`navigator.webdriver`) never get it.
- `src/shared/lib/analytics/analytics.utils.ts` sends page views and events through `track()`, the only way to count something. It overrides the address, title and referrer on each call, because the tracker's own stay on the landing page in a single-page app; `payload.utils.ts` cleans addresses (no hash, only `ref` and UTM parameters) and `beforeSend` (`data-before-send`) applies the same to the tracker's own requests and cancels them once statistics are off. Every call carries the site's version as Umami's tag (`data-tag`, from `package.json` through `vite.config.ts`), so the dashboard can compare releases.
- The first pageview sends session data (`session.utils.ts`, `umami.identify()` without an id): window width and pixel density in ranges, the theme and whether it was picked, the in-app browser (`shared/lib/browser`), and the site's version (as in the tag, so the dashboard lists it among the session properties). An address that matches no page is kept by `src/main.tsx` before the app replaces it with `/`, and goes out as `page-not-found` with the first pageview.
- The tracker's own speed report (`data-performance`: Core Web Vitals in Umami's Performance tab) needs it initialised, so only its pageviews are off (`data-auto-pageview="false"`). It takes every history write as a new page: a new view goes through `history.pushState`, while the section hash, same-view jumps and the first load's normalised address use `replaceAddress()` (`shared/lib/routes/address.utils.ts`), which passes its wrapper.
- While statistics are on, these listeners add detail (removed when they go off):
  - `engagement.utils.ts` sends `time-on-page` when the visitor leaves a page, switches tabs or closes it: engaged time (`time` as a dashboard group, `seconds`), scroll depth (`scroll`, in quarters) and the furthest section reached (`section`). Time counts only while the tab is visible and the visitor was active in the last 30 s. Each stretch is its own event, so a page's seconds add up.
  - `clicks.utils.ts` sends `dead-click` for a click or tap on something that does nothing (an image, a heading, text, a card's empty space) with `element`, `area` (section id, hero or landmark) and `label` (alt text, heading or card title), once per burst of quick clicks; a burst of three or more also sends `rage-click`. Cards are found by `data-card` (`shared/ui/Card`). Controls, links, drags, text selection and clicks without a pointer do not count.
  - `clicks.utils.ts` also sends `text-copy` (where copied text was, never the text), `engagement.utils.ts` `page-print`, and `errors.utils.ts` `js-error` for errors in the site's own scripts (at most three a page).
  - `input.utils.ts` adds `input` (mouse, touch, pen or keyboard) to every event a click or key started, so the dashboard tells taps from clicks. `link-ref`, `time-on-page` and `page-not-found` have none.
- The privacy policy (`privacy.content.tsx`) lists what is counted; a new event needs a line there too, and a row in `docs/analytics.md` (`tracking-plan.test.ts` checks it). `e2e/analytics.e2e.ts` checks the whole flow in real browsers with the real tracker.

## Images

- `public/assets/site/` (portrait, link-preview PNG) and `public/assets/cases/<case>/` (WebP screenshots, `thumbnail.webp`). Content refers to images by their path under `/assets`.
- `vite.config.ts` provides `virtual:asset-sizes`: the pixel size of every image, read from its PNG or WebP header at build time, so the image viewer can reserve the right space before an image arrives.
- Images load lazily on the page. A case study's full screenshots load in the background when the visitor shows interest in it: the pointer over, or keyboard focus on, a link to the case (`src/app/App/usePreloadCaseImages.ts`), and on arrival for the open case (`useCaseGallery`). The image viewer still opens at once, and a visitor who only reads the Work page does not download every screenshot (about 2.6 MB). Loading goes through `src/shared/media/image-preload/image-preload.utils.ts`: a few at a time, nothing with Save-Data or on 2G.
- Fonts are not preloaded. Checked on 2026-10-20: a `<link rel="preload" as="font">` with `crossorigin` makes WebKit download the font twice, and one without makes Chromium and Firefox do so; `e2e/loading.e2e.ts` checks that every font downloads once.
- No `srcset` on the lazy thumbnails. Checked on 2026-10-20: with a `srcset`, WebKit loads a `loading="lazy"` image eagerly, so the thumbnails competed with the first screen and held up the load event (`e2e/motion-a11y.e2e.ts` caught it). Smaller thumbnail files would need a single smaller `src` instead.

## Styling

Tailwind v4 with the defaults removed: only KitaBranding token utilities exist (`bg-bg-canvas`, `p-md`, `text-body-md`). Dark mode swaps CSS variables through the `dark` class on `<html>`; there are no `dark:` variants. See [design.md](design.md).

`src/styles/app.css` is the entry: it imports `tokens.css` (the token variables), `print.css`, `theme.css` (tokens → Tailwind theme), `utilities.css` (named utilities and variants), `base.css`, `dialog.css` (modal backdrop), `lightbox.css` (image viewer) and `motion.css` (theme cross-fade, reduced-motion reset). Component classes live in each component's `*.styles.ts`.

## Testing

- Vitest + Testing Library in jsdom; tests sit next to the code and query by role and accessible name.
- `src/app/content-rules.test.ts` checks the copy rules across all features; `src/styles/tokens.test.ts` checks the CSS tokens against the Figma export; `src/test/stories.test.tsx` runs every Storybook story (see Storybook above).
- Behaviour that needs a real browser (layout, focus, scrolling, motion, analytics) is checked with Playwright (`e2e/*.e2e.ts`, helpers in `e2e/helpers/`) and `yarn a11y` (`scripts/a11y-audit.ts`, checks in `scripts/a11y/`).

## Adding a page

1. Add the id to `VIEW`, its path to `VIEW_PATHS` and its title to `VIEW_TITLES` in `src/shared/lib/routes/routes.constants.ts`.
2. Create `src/features/<name>/` with the view folder (`<Name>View/`), `<name>.content.ts`, types, components and an `index.ts`.
3. Map the view in `src/app/App/App.constants.tsx` (`VIEW_RENDERERS`: a missing entry is a type error).
4. Add its description and breadcrumb name in `src/app/seo/seo.content.ts` and its URL in `public/sitemap.xml`. Its breadcrumb starts with `HOME_CRUMB`, or `WORK_CRUMB` if it is a case study.
5. `yarn verify`.
