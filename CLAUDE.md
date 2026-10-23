# portfolio

Karolina Kita's portfolio (karolina.kita.company), public repo github.com/karolinakita-ux/portfolio. React 19 + TypeScript (strict) + Tailwind v4 on Vite, tested with Vitest + Testing Library and Playwright, work on `develop`, deployed by Netlify from `main` on release. Package manager: **yarn** (v1). Dev machine: Windows 11, Node via fnm (`.node-version`).

## Commands

- `yarn dev` - local server at http://localhost:5173
- `yarn verify` - typecheck, lint (zero warnings), Prettier check, tests, production build. Run before every commit.
- `yarn test` - Vitest in watch mode; `yarn test:run` once
- `yarn e2e` - Playwright tests (`e2e/*.e2e.ts`) in Chromium, Firefox and WebKit against a fresh production build with prerendered pages on 127.0.0.1:5190. Run it after UI, motion or theme changes; it is not part of `yarn verify` or the Netlify build. `E2E_DEV=1 yarn e2e` tests the dev server; `--project chromium` or a spec name (`yarn e2e header-motion`) narrows a run. One run at a time (shared port and `test-results/`; `E2E_PORT` picks another port). First time: `yarn playwright install chromium firefox webkit`.
- `yarn storybook` - the component library at http://localhost:6006; `yarn build-storybook` builds it into `dist/storybook` (run after `yarn build`, which empties `dist/`)
- `yarn typecheck`, `yarn lint`, `yarn format` (writes), `yarn format:check`

## Layout

Vertical slices: `app` → `features` → `shared`, never the other way.

- `src/app/` - the shell: `App/` (`App.constants.tsx` maps every `View` to its feature's view), `routing/` (`useHistoryRoute.ts`: real paths, old `/#view` links redirect; `useSectionHash.ts`: the hash follows the section in view, except in in-app browsers; nothing else writes to the history while scrolling, because in-app browsers such as Messenger and LinkedIn flash a loading bar on every write; `useRouteFocus.ts`), `seo/` (`seo.content.ts` descriptions, `seo.utils.ts` head tags, structured data, llms.txt; `useDocumentHead.ts`), `analytics/` (pageviews), `prerender.entry.tsx`, `content-rules.test.ts` cross-feature copy checks.
- `src/features/<name>/` - one slice per page or capability: `work`, `about`, `contact`, `case-studies`, `image-viewer`, `privacy` (the policy page and the statistics consent box). A slice owns its view, components, hooks, copy (`*.content.ts`), types (`*.types.ts`) and tests. The app imports a feature only through its `index.ts`; features never import each other. Most copy edits happen in `*.content.ts`.
- `src/shared/` - used by several slices: `ui/` primitives, `layout/` header/footer, `media/` images, preload and the viewer context, `hooks/`, `lib/` (one folder per domain: `routes/` with `VIEW` ids, `VIEW_PATHS`, `SECTION` anchors, page titles and URL helpers; `ui/` with the shared class lists `FOCUS_RING`, `TEXT_LINK`, `BUTTON_HEIGHT`, `BULLET_LIST` and `EXTERNAL_LINK`; `analytics/`, `motion/`, `clipboard/`), `content/profile.ts`. Shared code never imports `app` or `features`.
- Repeated values (view ids, paths, section anchors, storage keys) are `as const` objects with a derived union type, never `enum` (`erasableSyntaxOnly`) and never repeated string literals.
- Every `Section` heading gets a copy-link anchor (`HeadingAnchor`); its `id` is the URL hash. Keep section ids stable: they are shared links.
- Imports: `#app/*`, `#features/*`, `#shared/*`, `#test/*` (subpath imports in `package.json`); `./x` within the same folder or below it; never `../`. A slice imports its own files across folders as `#features/<slice>/...`, never another slice's (ESLint, regex patterns).
- Files and folders (details and an example tree: `docs/architecture.md`, Files and folders): one component per folder, `Button/Button.tsx` + `Button.types.ts` (props) + `Button.styles.ts` (all its classes) + `Button.test.tsx`; one folder per domain for other modules (`lib/routes/routes.constants.ts`, `.types.ts`, `.utils.ts`); hooks `useX.ts`; other modules kebab-case with a role suffix (`*.content.ts`, `*.types.ts`, `*.styles.ts`, `*.constants.ts`, `*.context.ts`, `*.utils.ts`). No per-component barrel `index.ts`; only a feature's `index.ts` (its public API). ESLint caps files at 200 lines of code (tests and copy excepted).
- `e2e/` - Playwright specs (`*.e2e.ts`) and `helpers/` (in-page toolkit with the frame sampler and pill animation log, page setup, motion expectations), type-checked by `tsconfig.e2e.json`. Vitest only collects `src/**/*.test.ts(x)`.
- `scripts/` - `prerender.ts`, `a11y-audit.ts` (checks in `scripts/a11y/`).
- `.storybook/` - Storybook: `main.ts` (stories, addons, the one image folder the stories use), `preview.tsx` (site CSS and fonts, light/dark toolbar, axe as an error), `*-head.html` (noindex). Listed by name in `tsconfig.app.json`: `tsc` skips dot folders in `include` globs.
- `src/styles/tokens.css` - KitaBranding tokens as CSS variables (light + dark); `theme.css` maps them into Tailwind's theme; `app.css` imports both plus `utilities.css`, `base.css`, `dialog.css`, `lightbox.css`, `motion.css`, `print.css`. Test and story files are excluded from Tailwind's class scan (`@source not`).
- `src/styles/kita-branding.tokens.json` - Figma Variables export; `tokens.test.ts` keeps `tokens.css` 1:1 with it.
- `public/assets/` - images: `site/` (portrait, link-preview image) and `cases/<case>/` (screenshots, `thumbnail.webp`), referenced from content by their path under `/assets` (`cases/project-planning/thumbnail.webp`). Lowercase kebab-case. Screenshots are WebP (`sharp`, quality 90); the link-preview image stays PNG. No `srcset` on lazy images: WebKit then loads them eagerly and they hold up the page's load event (checked 2026-10-20). `/assets/*` is cached for a week, so a changed image gets a new file name.
- `docs/` - public project docs (design source, Figma links). Files and folders whose name starts with `_` (`docs/_*`) are private local notes: gitignored, never commit, quote or publish them.

## Design tokens (strict)

- Style only with token utilities: `bg-bg-canvas`, `text-text-secondary`, `border-border-subtle`, spacing `p-md` / `gap-lg` (3xs 2px … 4xl 96px), radius `rounded-sm|md|lg|xl|full`, shadows `shadow-sm…xl`, type `text-display-*`, `text-headline-*`, `text-title-*`, `text-label-*`, `text-body-*`.
- `theme.css` resets Tailwind's default colours, radii, shadows and font sizes, so `bg-gray-100` or `text-lg` do not exist. Never add hex values or arbitrary values where a token exists.
- Dark mode swaps CSS variables via `.dark` on `<html>`. Do not use `dark:` variants.
- Motion: `duration-fast|medium|slow` (150 / 240 / 300ms) and `ease-standard`, from the `--motion-*` tokens. Never `duration-150`, `ease-out` or a raw ms value (`src/styles/motion-tokens.test.ts`). Motion stays calm: nothing moves on the first screen at load, nothing loops past 5 s, and `prefers-reduced-motion` makes every change instant (the CSS rule in `motion.css`; animations started from JS check `prefersReducedMotion()`).
- New token: add it in Figma, re-export `kita-branding.tokens.json`, then add the variable to `tokens.css` (both modes; motion tokens once, they have no mode) and the mapping in `theme.css`. Mirror it in the KitaBranding design system on claude.ai.
- WCAG 2.1 AA minimum: keyboard focus (`FOCUS_RING`), labelled controls, semantic headings and landmarks.
- A row of text links that can wrap (the Behind the Design banner) is spaced like buttons: each link gets `BUTTON_HEIGHT` (`shared/lib/ui/ui.styles.ts`: a bordered Button's height) and the row `gap-y-sm`. Karolina's rule: tighter rows look cramped.
- On focusable elements, list the transitioned properties (`transition-[color,background-color]`, as `Button.styles.ts` does). `transition-colors` also animates `outline-color`, so the focus ring would fade in instead of appearing at once (`e2e/motion-a11y.e2e.ts` checks it).

## Copy rules (Karolina's, enforced by `src/app/content-rules.test.ts`)

- Short hyphen with spaces (`word - word`, `2019 - 2026`). Never en or em dashes.
- Every case-study bullet opens with a bold lead-in and colon: build bullets with `lead("Term", "text")` from `shared/ui/lead/lead.tsx`.
- H1 headings never end with a period.
- Plain, grounded B2-level English. No buzzwords or corporate fluff. Keep claims honest about team roles and verified outcomes; reflections stay general.

## Code conventions

- TypeScript strict with `noUncheckedIndexedAccess`; no `any`. Import with explicit extensions (`./App.tsx`), `import type` for types.
- Files that export components export only components (Fast Refresh); helpers live in `*.utils.ts`, constants in `*.constants.ts`, types in `*.types.ts`, contexts in `*.context.ts`.
- Classes: a component's Tailwind classes live in its `*.styles.ts` as a `styles` object (one key per element; state-dependent ones are functions, `styles.pill(active)`), composed with `clsx` (object syntax for toggles: `clsx("...", { "rotate-180": open })`). Variant sets use `cva` with the variant names from Figma (`button({ variant })`, `callout({ tone })`, `card({ layout, gap })`). Prettier sorts classes inside `clsx()` and `cva()`. ESLint rejects class strings inside `className`; compute state before the JSX (`const loaded = status === "loaded"`) rather than in the attribute. No `tailwind-merge`: it reads token type styles as colours and drops them (`text-body-md` vs `text-text-primary`), so give conflicting classes a variant instead.
- Library first: before writing markup, use the `shared/ui` primitive that exists (`Card`, `Badge`, `PageTitle`, `Button`, `IconButton`, `Callout`, `Section`, `Dialog`, `Accordion`/`AccordionItem`, `Avatar`, `VisuallyHidden`, `NewTabNote`, `Breadcrumb`, `CopyEmail`). External links spread `EXTERNAL_LINK` and end with `<NewTabNote />`.
- ESLint: typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, `@eslint-react`, `jsx-a11y`, Vitest + Testing Library rules, and the slice boundaries (`no-restricted-imports` with `regex` patterns: in gitignore-style `group` patterns a leading `#` is a comment, which once switched the boundaries off unnoticed). Fix the code rather than disabling a rule; a needed exception is a one-line disable with a reason after `--`. Prettier sorts imports by layer.
- Visitor statistics (Umami) are opt-in: the script loads only after the visitor allows it in the consent box or on /privacy (`shared/lib/analytics/statistics-consent.utils.ts`; ePrivacy Art. 5(3) and Art. 399 of Prawo komunikacji elektronicznej need consent for a script that reads device data, cookies or not). New events go through `track()`; never load a tracker any other way. The tracking plan `docs/analytics.md` holds the naming rules (kebab-case `<object>-<verb>` for actions, noun phrases for measurements, context in properties) and a row per event and session property (`tracking-plan.test.ts`). Address changes that are not a new page use `replaceAddress()` (`shared/lib/routes/address.utils.ts`), never `history.replaceState` with a URL: the tracker's speed report takes each one as a new page. `umami.identify()` gets session data only, never an id. Each event needs a line in the privacy policy; a new kind of data (not one more click of a kind already listed) also bumps `STORED_CHOICE.on` in `analytics.constants.ts`, so earlier yeses are asked again, and goes into the consent box text. On `yarn dev` the consent box shows on every page load to check its design (`consentPreview`; an answer hides it until reload, nothing loads); automated browsers (`navigator.webdriver`: e2e, `yarn a11y`) do not get it.
- React Compiler lint rules are on: no `setState` inside effects, no ref reads during render. Derive state instead (see `useImageStatus`, `useScrolledPast`). An object returned by a hook that holds a ref counts as a ref: destructure it (`const { status, setImage } = useRevealedImage(src)`).
- Tests sit next to the code (`*.test.ts(x)`); query by role and accessible name. jsdom gaps are polyfilled in `src/test/setup.ts`.
- Stories: every component folder in `shared/ui`, `shared/layout` and `shared/media` has a `Name.stories.tsx` (a small sibling may be shown in another's story: `COVERED_ELSEWHERE` in `src/test/stories.test.tsx`). That test runs every story in Vitest (render, its `play` checks, axe) and fails when a component has no story. Import `userEvent` and `expect` from `storybook/test`; give stories real copy from the site.
- Line endings are LF (`.gitattributes`). Netlify builds on Linux, so file names are case-sensitive.

## Git workflow (full process: `CONTRIBUTING.md`)

- Work on `develop`. Never commit or push to `main` except in a release the user asked for.
- Every commit: `yarn verify`, bump `version` in `package.json` (semver rules in `CONTRIBUTING.md`), add a `###` entry under `## Unreleased` in `CHANGELOG.md`, all in the same commit. Put the version in the subject: `... (1.2.0)`.
- Stage files by name, only the ones you changed. Never `git add -A` or `git commit -a`: the user often has unfinished edits in the tree. Check `git status` before committing and leave anything you did not write unstaged.
- Engineering commits (structure, refactors, tooling, libraries) carry `Co-authored-by: Mateusz Kita <mkita.webdev@gmail.com>` beside the Claude trailer (`CONTRIBUTING.md`).

### Skills and agents (`.claude/`)

- `/release` (`.claude/skills/release/`): the release, only when the user asks for one. Compare against `origin/main`, not local `main`.
- `ship-change` (`.claude/skills/ship-change/`): the commit routine above, step by step.
- Agents: `a11y-reviewer` (runs `yarn a11y`, reviews WCAG 2.1 AA) and `copy-reviewer` (Karolina's copy rules). Both only report.

Uncommitted user edits stay out of commits and releases. If `git switch` refuses because of them, stop and ask; do not stash or discard them.

## Deploy

Netlify project `karolina-kita`. Production deploys from `main` (releases only); `develop` gets a branch deploy at `develop--karolina-kita.netlify.app`. Each build runs `yarn test:run && yarn build` and publishes `dist/` (see `netlify.toml`). `yarn build` ends with `yarn prerender`: an SSR build of `src/app/prerender.entry.tsx` and `scripts/prerender.ts`, which writes static HTML per page (`about.html` + `about/index.html`), `404.html` and `llms.txt`. A new view needs its path in `VIEW_PATHS`, a description in `seo.content.ts` and a line in `public/sitemap.xml`; tests check all three. When a page's visible content or its structured data changes, set its `<lastmod>` in the sitemap to the release date (Google trusts the dates only while they stay accurate). Hashed bundles go to `/static/` (cached for a year by `public/_headers`). Production builds (main) also run `yarn build-storybook`: Storybook is served at `/storybook/` with `X-Robots-Tag: noindex`; the Work page hero and the Behind the Design banner link it (`PROFILE.storybookUrl`: absolute in builds, so branch deploys and the artifact reach the live one; on `yarn dev` it is the local `yarn storybook` on port 6006), and its bundles never load on the site's pages. `public/googlecf978c6093e1d8a5.html` is Google Search Console's ownership file (HTML file method, property `https://karolina.kita.company/`): Google rechecks it, so never remove, rename or edit it (`src/app/seo/site-verification.test.ts` fails if it changes; `_headers` keeps it out of search results). A preview opened before a deploy reloads once when its story files are gone (`vite:preloadError` in `.storybook/preview-head.html`). Branch deploys skip it.

## Pitfalls (learned; details in Claude's local lessons log)

- Write files that contain backslashes (regexes, `\n` in strings) with the Write or Edit tool, or `String.raw` in JS. Bash heredocs on this Windows machine have silently eaten backslashes or failed to parse several times.
- Prove a new guard (lint rule, test) works: one probe that must fail and one that must pass, in NEW temporary files deleted afterwards, never edits to real files. No `|| true` after a restore step.
- Before wrapping a third-party script or library, read its current source for what each option does (the Umami tracker keeps a stale URL when its auto-tracking is off).
- Releases compare against `origin/main` after `git fetch`, and a deploy counts only when Netlify's current deploy points at the release commit (the Netlify MCP, then `curl` the live site).
- Check that a running dev or preview server serves the change before measuring; start your own on a spare port rather than trusting one already running.
- Check a pure restructure by building before and after and comparing every prerendered page and the CSS, not only by tests.
- One copy of React: `package.json` `resolutions` pins `react` and `react-dom`, because Storybook's docs addon once pulled a second, newer copy ("Cannot read properties of null (reading 'useId')"). Bump both versions there when upgrading React.
