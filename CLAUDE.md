# kkita-portfolio

Karolina Kita's portfolio (karolina.kita.company). React 19 + TypeScript (strict) + Tailwind v4 on Vite, tested with Vitest + Testing Library, work on `develop`, deployed by Netlify from `main` on release. Package manager: **yarn** (v1). Dev machine: Windows 11, Node via fnm (`.node-version`).

## Commands

- `yarn dev` - local server at http://localhost:5173
- `yarn verify` - typecheck, lint, tests, production build. Run before every commit.
- `yarn test` - Vitest in watch mode; `yarn test:run` once
- `yarn typecheck`, `yarn lint`, `yarn format`

## Layout

- `src/content/` - all copy, typed by `src/content/types.ts`. Most edits happen here, not in views.
- `src/views/` - one component per page; `src/App.tsx` maps every `View` to a renderer.
- `src/components/` - `ui/` primitives, `layout/` header/footer, `media/` images + lightbox, `case/` case-study blocks.
- `src/lib/routes.ts` - the `VIEWS` list, hash routing helpers, page titles.
- `src/styles/tokens.css` - KitaBranding tokens as CSS variables (light + dark); `app.css` maps them into Tailwind's theme.
- `src/styles/kita-branding.tokens.json` - Figma Variables export; `tokens.test.ts` keeps `tokens.css` 1:1 with it.
- `public/assets/` - images, referenced by file name from content (`/assets/<name>`). Lowercase kebab-case names.

## Design tokens (strict)

- Style only with token utilities: `bg-bg-canvas`, `text-text-secondary`, `border-border-subtle`, spacing `p-md` / `gap-lg` (3xs 2px … 4xl 96px), radius `rounded-sm|md|lg|xl|full`, shadows `shadow-sm…xl`, type `text-display-*`, `text-headline-*`, `text-title-*`, `text-label-*`, `text-body-*`.
- `app.css` resets Tailwind's default colours, radii, shadows and font sizes, so `bg-gray-100` or `text-lg` do not exist. Never add hex values or arbitrary values where a token exists.
- Dark mode swaps CSS variables via `.dark` on `<html>`. Do not use `dark:` variants.
- New token: add it in Figma, re-export `kita-branding.tokens.json`, then add the variable to `tokens.css` (both modes) and the mapping in `app.css`.
- WCAG 2.1 AA minimum: keyboard focus (`FOCUS_RING`), labelled controls, semantic headings and landmarks.

## Copy rules (Karolina's, enforced by `src/content/content.test.ts`)

- Short hyphen with spaces (`word - word`, `2019 - 2026`). Never en or em dashes.
- Every case-study bullet opens with a bold lead-in and colon: build bullets with `lead("Term", "text")` from `components/ui/lead.tsx`.
- H1 headings never end with a period.
- Plain, grounded B2-level English. No buzzwords or corporate fluff. Keep claims honest about team roles and verified outcomes; reflections stay general.
- The CV is ATS plain text: no curly quotes or long dashes, ISO dates.

## Code conventions

- TypeScript strict with `noUncheckedIndexedAccess`; no `any`. Import with explicit extensions (`./App.tsx`), `import type` for types.
- Files that export components export only components (Fast Refresh); helpers live in `src/lib/`, contexts in `*-context.ts`.
- React Compiler lint rules are on: no `setState` inside effects, no ref reads during render. Derive state instead (see `useImageStatus`, `useScrolledPast`).
- Tests sit next to the code (`*.test.ts(x)`); query by role and accessible name. jsdom gaps are polyfilled in `src/test/setup.ts`.
- Line endings are LF (`.gitattributes`). Netlify builds on Linux, so file names are case-sensitive.

## Git workflow (full process: `CONTRIBUTING.md`)

- Work on `develop`. Never commit or push to `main` except in a release the user asked for.
- Every commit: `yarn verify`, bump `version` in `package.json` (semver rules in `CONTRIBUTING.md`), add a `###` entry under `## Unreleased` in `CHANGELOG.md`, all in the same commit. Put the version in the subject: `... (1.2.0)`.
- Stage files by name, only the ones you changed. Never `git add -A` or `git commit -a`: the user often has unfinished edits in the tree. Check `git status` before committing and leave anything you did not write unstaged.

### When the user asks for a release

Follow "Releases" in `CONTRIBUTING.md` step by step:

1. On `develop`: pull, `yarn verify`, and show the user `git log --oneline main..develop` plus the `## Unreleased` entries. Stop and ask if verify fails, if a commit has no changelog entry, or if `main` has commits that are not on `develop`.
2. Write the release notes (rules in `CONTRIBUTING.md`) and rename `## Unreleased` to `## Release vX.Y.Z - YYYY-MM-DD`. No version bump for the release itself.
3. Commit `CHANGELOG.md` only as `Release vX.Y.Z`, merge `develop` into `main` with `--no-ff`, tag `vX.Y.Z`, push `main` with tags, then fast-forward `develop` to `main` and push it.
4. Use the Netlify MCP (project `karolina-kita`) to check that the production deploy of the release commit is ready. If it failed, read the deploy log and report.
5. Reply with the version, the release notes as written, and the deploy result.

Uncommitted user edits stay out of the release. If `git switch` refuses because of them, stop and ask; do not stash or discard them.

## Deploy

Netlify project `karolina-kita`. Production deploys from `main` (releases only); `develop` gets a branch deploy at `develop--karolina-kita.netlify.app`. Each build runs `yarn test:run && yarn build` and publishes `dist/` (see `netlify.toml`). Hashed bundles go to `/static/` (cached for a year by `public/_headers`).
