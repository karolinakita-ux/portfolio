# kkita-portfolio

Karolina Kita's portfolio (karolina.kita.company). React 19 + TypeScript (strict) + Tailwind v4 on Vite, tested with Vitest + Testing Library, deployed by Netlify from `main`. Package manager: **yarn** (v1). Dev machine: Windows 11, Node via fnm (`.node-version`).

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
- CV and cover letter are ATS plain text: no curly quotes or long dashes, ISO dates.

## Code conventions

- TypeScript strict with `noUncheckedIndexedAccess`; no `any`. Import with explicit extensions (`./App.tsx`), `import type` for types.
- Files that export components export only components (Fast Refresh); helpers live in `src/lib/`, contexts in `*-context.ts`.
- React Compiler lint rules are on: no `setState` inside effects, no ref reads during render. Derive state instead (see `useImageStatus`, `useScrolledPast`).
- Tests sit next to the code (`*.test.ts(x)`); query by role and accessible name. jsdom gaps are polyfilled in `src/test/setup.ts`.
- Line endings are LF (`.gitattributes`). Netlify builds on Linux, so file names are case-sensitive.

## Versioning

Every commit bumps `version` in `package.json` (major / minor / patch, rules at the top of `CHANGELOG.md`) and adds a matching `CHANGELOG.md` entry in the same commit.

## Deploy

Push to `main`: Netlify runs `yarn test:run && yarn build` and publishes `dist/` (see `netlify.toml`). Pull requests get deploy previews. Hashed bundles go to `/static/` (cached for a year by `public/_headers`).
