# Karolina Kita - portfolio

Source of **[karolina.kita.company](https://karolina.kita.company)**, the portfolio of Karolina Kita, Senior Product Designer. Three case studies (an automotive B2B marketplace, a project planning and cost management platform and a white-label theme generator), an About page, contact details and a privacy page.

Designed by Karolina in Figma and built with [Claude Code](docs/claude-code.md): React 19, TypeScript (strict), Tailwind CSS v4 with her KitaBranding design tokens, Vite, Vitest and Playwright. Deployed on Netlify.

## What is inside

- **Design tokens from Figma.** Every colour, space, radius, shadow and type style is a token exported from the Figma file; a test fails when the CSS drifts from the export. Light and dark mode swap the same variables. [Design source](docs/design.md)
- **Component library in Storybook.** Every shared component has stories with its Figma variants and real copy, published at [karolina.kita.company/storybook](https://karolina.kita.company/storybook/) with a welcome page on the design system. Each story is also a test: it renders, runs its interaction checks and passes axe. [Storybook](docs/architecture.md#storybook)
- **Vertical slices.** Each page is a feature folder with its own view, copy, types and tests; ESLint enforces the boundaries between `app`, `features` and `shared`. [Architecture](docs/architecture.md)
- **Real pages, prerendered.** Every page has its own URL (`/work/project-planning`) and is written to static HTML at build time, so search engines, link previews and AI assistants read the full content without JavaScript. Per-page titles, descriptions, structured data, a sitemap and [`/llms.txt`](https://karolina.kita.company/llms.txt).
- **Section links.** Each section heading has a link that copies its address (`/about#career`); the address bar follows the section you are reading.
- **Accessible by design.** WCAG 2.2 AA is the minimum: keyboard focus that nothing covers, labelled controls, landmarks, reduced motion. `yarn a11y` audits every page in real Chromium (axe, an emulated screen reader, the Tab order with a check that no focused element is hidden, also with the consent box showing, reflow at 320 px and 400% zoom).
- **Readable as plain text.** Search engines and AI assistants read the HTML without CSS, so neighbouring elements always have a space between them; a test renders every page and checks it. Favicons in SVG, PNG and ICO, because Google Search does not read SVG ones.
- **Image viewer.** Screenshots open full size with zoom, swipe and arrow keys; WebP images and loading a case's screenshots as soon as a visitor points at it keep it fast.
- **Statistics only with consent.** Visits, time on page, clicks (including taps on things that do nothing, told apart from mouse clicks), page speed and errors are counted with [Umami](https://umami.is) only after the visitor allows it in the consent box. No cookies; with Do Not Track or Global Privacy Control on, nobody is asked and nothing loads. The [privacy page](https://karolina.kita.company/privacy) explains it and has the switch. [Visitor statistics](docs/architecture.md#visitor-statistics), [tracking plan](docs/analytics.md)
- **Quality gate.** `yarn verify` runs the typecheck, ESLint with zero warnings, a Prettier check, 580+ tests and the full build before every commit.

## Getting started

Needs Node (version in `.node-version`, for example through [fnm](https://github.com/Schniz/fnm)) and Yarn 1.

```sh
fnm use        # Node version from .node-version
yarn           # install
yarn dev       # http://localhost:5173
```

## Scripts

| Command                | What it does                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `yarn dev`             | Dev server with hot reload                                                             |
| `yarn verify`          | Typecheck, lint (zero warnings), format check, tests, build and prerender              |
| `yarn test`            | Vitest in watch mode (`yarn test:run` for a single run)                                |
| `yarn e2e`             | Playwright tests in Chromium, Firefox and WebKit against the production build          |
| `yarn build`           | Typecheck, build to `dist/`, then prerender every page (`yarn prerender`)              |
| `yarn preview`         | Serve the production build locally                                                     |
| `yarn lint`            | ESLint, zero warnings allowed                                                          |
| `yarn format`          | Prettier: formats files, sorts imports and Tailwind classes (`yarn format:check`)      |
| `yarn a11y`            | Accessibility audit in real Chromium; report in `a11y-report/`                         |
| `yarn favicons`        | Remakes the PNG and ICO site icons from `public/favicon.svg` (commit the files)        |
| `yarn storybook`       | The component library (Storybook) on port 6006                                         |
| `yarn build-storybook` | Builds Storybook into `dist/storybook` (run after `yarn build`, which empties `dist/`) |

## Where things live

```
index.html                     <head>: site-wide meta, structured data, theme script
public/                        copied as-is: robots.txt, sitemap.xml, _headers, _redirects, assets/,
                               site icons (favicon.svg and its PNG and ICO copies),
                               Google Search Console's verification file (keep it)
public/assets/site/            portrait and link-preview image
public/assets/cases/<case>/    case-study screenshots and thumbnail (WebP)
src/app/                       shell: App, routing, section hash, SEO, prerender entry, copy tests
src/features/<name>/           one slice per page or capability (image viewer, privacy and the consent box):
                               view, components, copy (*.content.ts), types, tests
src/shared/                    ui/, layout/, media/, hooks/, lib/ (routes, ui, analytics, motion, clipboard),
                               content/ (profile)
src/styles/                    tokens.css (light/dark), theme.css (Tailwind theme), app.css (entry), Figma export
e2e/                           Playwright specs and their helpers
scripts/                       prerender.ts (static HTML per page), a11y-audit.ts (checks in a11y/),
                               favicons.ts (PNG and ICO icons from the SVG)
docs/                          architecture, design source, tracking plan (analytics.md), working with Claude Code
.storybook/                    Storybook config and its Welcome page (stories sit next to their component)
.claude/                       Claude Code skills and review agents (when to use each: CONTRIBUTING.md)
```

## Editing content

Most edits are copy changes in `src/features/*/*.content.ts` (case studies in `src/features/case-studies/`). The writing rules (plain English, short hyphens, bold lead-ins on case-study bullets) are checked by `src/app/content-rules.test.ts`.

To add a screenshot to a case study, put a WebP file in `public/assets/cases/<case>/` and reference it by its path under `/assets`:

```ts
{
  id: "roadmap",
  asset: "cases/project-planning/08-roadmap-gantt-goals-decomposition.webp",          // full screen, opens in the viewer
  detail: "cases/project-planning/08-roadmap-gantt-goals-decomposition--detail.webp", // optional close-up shown on the card
}
```

Images are cached for a week, so a changed image gets a new file name.

## Deploy and releases

Work happens on `develop`; `main` is the live site and changes only in a release. Every commit bumps the version and adds a `CHANGELOG.md` entry. Branches, versions and the release steps: [CONTRIBUTING.md](CONTRIBUTING.md). Netlify builds only `main`, with `yarn test:run && yarn build && yarn build-storybook`, and publishes `dist/` (Storybook at `/storybook/`); a failing test blocks the deploy. `develop` is never built or deployed.

Link previews and search results are cached by other services: after a release that changes a page's title, description, link-preview image or the site icon, refresh them with the tools listed in [CONTRIBUTING.md](CONTRIBUTING.md#5-refresh-what-other-services-cached).

## Licence

All rights reserved: the code, copy, images and design are published to be viewed, not reused. See [LICENSE](LICENSE); the notices for third-party icons and fonts are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
