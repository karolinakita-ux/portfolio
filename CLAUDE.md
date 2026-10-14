# portfolio

Karolina Kita's portfolio (karolina.kita.company), public repo github.com/karolinakita-ux/portfolio. React 19 + TypeScript (strict) + Tailwind v4 on Vite, tested with Vitest + Testing Library and Playwright, work on `develop`, deployed by Netlify from `main` on release. Package manager: **yarn** (v1). Dev machine: Windows 11, Node via fnm (`.node-version`).

## Commands

- `yarn dev` - local server at http://localhost:5173
- `yarn verify` - typecheck, lint (zero warnings), Prettier check, tests, production build. Run before every commit.
- `yarn test` - Vitest in watch mode; `yarn test:run` once
- `yarn e2e` - Playwright tests (`e2e/*.e2e.ts`) in Chromium, Firefox and WebKit against a fresh production build with prerendered pages on 127.0.0.1:5190. Run it after UI, motion or theme changes; it is not part of `yarn verify` or the Netlify build. `E2E_DEV=1 yarn e2e` tests the dev server; `--project chromium` or a spec name (`yarn e2e header-motion`) narrows a run. One run at a time (shared port and `test-results/`; `E2E_PORT` picks another port). First time: `yarn playwright install chromium firefox webkit`.
- `yarn typecheck`, `yarn lint`, `yarn format` (writes), `yarn format:check`

## Layout

Vertical slices: `app` → `features` → `shared`, never the other way.

- `src/app/` - the shell: `App.tsx` maps every `View` to its feature's view, `useHistoryRoute.ts` routing (real paths, old `/#view` links redirect), `useSectionHash.ts` (the hash follows the section in view), `seo.content.ts` + `seo.utils.ts` (descriptions, head tags, structured data, llms.txt), `prerender.entry.tsx`, `content-rules.test.ts` cross-feature copy checks.
- `src/features/<name>/` - one slice per page or capability: `work`, `about`, `contact`, `cv`, `case-studies`, `image-viewer`. A slice owns its view, components, hooks, copy (`*.content.ts`), types (`*.types.ts`) and tests. The app imports a feature only through its `index.ts`; features never import each other. Most copy edits happen in `*.content.ts`.
- `src/shared/` - used by several slices: `ui/` primitives, `layout/` header/footer, `media/` images, preload and the viewer context, `hooks/`, `lib/` (`routes.ts`: `VIEW` ids, `VIEW_PATHS`, `SECTION` anchors, routing helpers, page titles; `ui.utils.ts`: `cn`, `FOCUS_RING`), `content/profile.ts`. Shared code never imports `app` or `features`.
- Repeated values (view ids, paths, section anchors, storage keys) are `as const` objects with a derived union type, never `enum` (`erasableSyntaxOnly`) and never repeated string literals.
- Every `Section` heading gets a copy-link anchor (`HeadingAnchor`); its `id` is the URL hash. Keep section ids stable: they are shared links.
- Imports: `#app/*`, `#features/*`, `#shared/*`, `#test/*` (subpath imports in `package.json`), `./x` within the same folder.
- File names: components `PascalCase.tsx`, hooks `useX.ts`, other modules kebab-case with a role suffix (`*.content.ts`, `*.types.ts`, `*.constants.ts`, `*.context.ts`, `*.utils.ts`), tests `*.test.ts(x)` next to the file.
- `e2e/` - Playwright specs (`*.e2e.ts`) and `helpers.ts` (in-page frame sampler, pill animation log, theme setup), type-checked by `tsconfig.e2e.json`. Vitest only collects `src/**/*.test.ts(x)`.
- `src/styles/tokens.css` - KitaBranding tokens as CSS variables (light + dark); `app.css` maps them into Tailwind's theme.
- `src/styles/kita-branding.tokens.json` - Figma Variables export; `tokens.test.ts` keeps `tokens.css` 1:1 with it.
- `public/assets/` - images: `site/` (portrait, link-preview image) and `cases/<case>/` (screenshots, `thumbnail.webp`), referenced from content by their path under `/assets` (`cases/meetestim/thumbnail.webp`). Lowercase kebab-case. Screenshots are WebP (`sharp`, quality 90); the link-preview image stays PNG. `/assets/*` is cached for a week, so a changed image gets a new file name.
- `docs/` - public project docs (design source, Figma links). Files and folders whose name starts with `_` (`docs/_*`) are private local notes: gitignored, never commit, quote or publish them.

## Design tokens (strict)

- Style only with token utilities: `bg-bg-canvas`, `text-text-secondary`, `border-border-subtle`, spacing `p-md` / `gap-lg` (3xs 2px … 4xl 96px), radius `rounded-sm|md|lg|xl|full`, shadows `shadow-sm…xl`, type `text-display-*`, `text-headline-*`, `text-title-*`, `text-label-*`, `text-body-*`.
- `app.css` resets Tailwind's default colours, radii, shadows and font sizes, so `bg-gray-100` or `text-lg` do not exist. Never add hex values or arbitrary values where a token exists.
- Dark mode swaps CSS variables via `.dark` on `<html>`. Do not use `dark:` variants.
- Motion: `duration-fast|medium|slow` (150 / 240 / 300ms) and `ease-standard`, from the `--motion-*` tokens. Never `duration-150`, `ease-out` or a raw ms value (`src/styles/motion-tokens.test.ts`). Motion stays calm: nothing moves on the first screen at load, nothing loops past 5 s, and `prefers-reduced-motion` makes every change instant (the CSS rule in `app.css`; animations started from JS check `prefersReducedMotion()`).
- New token: add it in Figma, re-export `kita-branding.tokens.json`, then add the variable to `tokens.css` (both modes; motion tokens once, they have no mode) and the mapping in `app.css`. Mirror it in the KitaBranding design system on claude.ai.
- WCAG 2.1 AA minimum: keyboard focus (`FOCUS_RING`), labelled controls, semantic headings and landmarks.
- On focusable elements, list the transitioned properties (`transition-[color,background-color]`, as `Button.tsx` does). `transition-colors` also animates `outline-color`, so the focus ring would fade in instead of appearing at once (`e2e/motion-a11y.e2e.ts` checks it).

## Copy rules (Karolina's, enforced by `src/app/content-rules.test.ts`)

- Short hyphen with spaces (`word - word`, `2019 - 2026`). Never en or em dashes.
- Every case-study bullet opens with a bold lead-in and colon: build bullets with `lead("Term", "text")` from `shared/ui/lead.tsx`.
- H1 headings never end with a period.
- Plain, grounded B2-level English. No buzzwords or corporate fluff. Keep claims honest about team roles and verified outcomes; reflections stay general.
- The CV is ATS plain text: no curly quotes or long dashes, ISO dates.

## Code conventions

- TypeScript strict with `noUncheckedIndexedAccess`; no `any`. Import with explicit extensions (`./App.tsx`), `import type` for types.
- Files that export components export only components (Fast Refresh); helpers live in `*.utils.ts` (slice) or `src/shared/lib/`, contexts in `*.context.ts`.
- ESLint: typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, `@eslint-react`, `jsx-a11y`, Vitest + Testing Library rules, and the slice boundaries (`no-restricted-imports`). Fix the code rather than disabling a rule; a needed exception is a one-line disable with a reason after `--`. Prettier sorts imports by layer.
- React Compiler lint rules are on: no `setState` inside effects, no ref reads during render. Derive state instead (see `useImageStatus`, `useScrolledPast`).
- Tests sit next to the code (`*.test.ts(x)`); query by role and accessible name. jsdom gaps are polyfilled in `src/test/setup.ts`.
- Line endings are LF (`.gitattributes`). Netlify builds on Linux, so file names are case-sensitive.

## Git workflow (full process: `CONTRIBUTING.md`)

- Work on `develop`. Never commit or push to `main` except in a release the user asked for.
- Every commit: `yarn verify`, bump `version` in `package.json` (semver rules in `CONTRIBUTING.md`), add a `###` entry under `## Unreleased` in `CHANGELOG.md`, all in the same commit. Put the version in the subject: `... (1.2.0)`.
- Stage files by name, only the ones you changed. Never `git add -A` or `git commit -a`: the user often has unfinished edits in the tree. Check `git status` before committing and leave anything you did not write unstaged.

### Skills and agents (`.claude/`)

- `/release` (`.claude/skills/release/`): the release, only when the user asks for one. Compare against `origin/main`, not local `main`.
- `ship-change` (`.claude/skills/ship-change/`): the commit routine above, step by step.
- Agents: `a11y-reviewer` (runs `yarn a11y`, reviews WCAG 2.1 AA) and `copy-reviewer` (Karolina's copy rules). Both only report.

Uncommitted user edits stay out of commits and releases. If `git switch` refuses because of them, stop and ask; do not stash or discard them.

## Deploy

Netlify project `karolina-kita`. Production deploys from `main` (releases only); `develop` gets a branch deploy at `develop--karolina-kita.netlify.app`. Each build runs `yarn test:run && yarn build` and publishes `dist/` (see `netlify.toml`). `yarn build` ends with `yarn prerender`: an SSR build of `src/app/prerender.entry.tsx` and `scripts/prerender.ts`, which writes static HTML per page (`about.html` + `about/index.html`), `404.html` and `llms.txt`. A new view needs its path in `VIEW_PATHS`, a description in `seo.content.ts` and a line in `public/sitemap.xml`; tests check all three. Hashed bundles go to `/static/` (cached for a year by `public/_headers`).
