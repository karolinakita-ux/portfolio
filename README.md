# Karolina Kita - portfolio

Source of **[karolina.kita.company](https://karolina.kita.company)**, the portfolio of Karolina Kita, Senior Product Designer. Four case studies (a mobile ticketing app and transit operations console, an automotive B2B marketplace, a project planning and cost management platform and a white-label theme generator), an About page, a CV page with a PDF made from it, contact details, a privacy page and an accessibility statement.

Designed by Karolina in Figma and built with [Claude Code](docs/claude-code.md): React 19, TypeScript (strict), Tailwind CSS v4 with her KitaBranding design tokens, Vite, Vitest and Playwright. Deployed on Netlify.

## What is inside

- **Design tokens from Figma.** Every colour, space, radius, shadow and type style is a token exported from the Figma file; a test fails when the CSS drifts from the export. Light and Dark mode swap the same variables. [Design source](docs/design.md)
- **Component library in Storybook.** Every shared component has stories with its Figma variants and real copy, published at [karolina.kita.company/storybook](https://karolina.kita.company/storybook/) with a welcome page on the design system. Each story is also a test: it renders, runs its interaction checks and passes axe. [Storybook](docs/architecture.md#storybook)
- **Vertical slices.** Each page is a feature folder with its own view, copy, types and tests; ESLint enforces the boundaries between `app`, `features` and `shared`. [Architecture](docs/architecture.md)
- **Real pages, prerendered.** Every page has its own URL (`/work/project-planning`) and is written to static HTML at build time, so search engines, link previews and AI assistants read the full content without JavaScript. The browser keeps that HTML when the app starts (React hydration), so nothing is drawn twice, and every image in it has its width and height, so the text below does not jump while images load. Per-page titles, descriptions, structured data, a sitemap and [`/llms.txt`](https://karolina.kita.company/llms.txt).
- **Section links.** Each section heading has a link that copies its address with a tag for the visitor statistics: `/about?ref=section-link#career`, or the tag the copier came with. The address bar follows the section you are reading (not in in-app browsers, which flash a loading bar at every address change). A section link lands on its heading as soon as the page arrives, before the site's script, also in in-app browsers such as Messenger and LinkedIn, and lets go at the visitor's first touch, scroll, key or click.
- **Accessible by design.** WCAG 2.2 AA is the minimum: keyboard focus that nothing covers, labelled controls, landmarks, reduced motion, text that follows the browser's text size (sizes in rem), stronger colours when the system asks for more contrast, and Windows contrast themes. `yarn a11y` audits every page in real Chromium (axe, an emulated screen reader, the Tab order with a check that no focused element is hidden, also with the consent box showing, reflow at 320 px and 400% zoom, 200% text size, forced colours).
- **Calm motion.** Motion only where it has a job: the menu's gold pill slides to the new page, carrying the current page's underline (the gold alone is too faint to show a state), and cards fade in as they scroll into view from tablet width up. Nothing moves on the first screen at load, nothing loops, and reduced motion makes every change instant. [Motion guide](docs/motion.md)
- **Readable as plain text.** Search engines and AI assistants read the HTML without CSS, so neighbouring elements always have a space between them; a test renders every page and checks it. Favicons in SVG, PNG and ICO, because Google Search does not read SVG ones.
- **A CV for people and machines.** `/cv` is the CV as a page (in Light and Dark mode, following the browser's text size), and `yarn cv-pdf` prints that page to a tagged A4 PDF with real text, an outline and clickable links, so its text copies out as clean words. A test fails when the page's text or classes change and the PDF does not.
- **Image viewer.** Screenshots open full size, with swipe and arrow keys. A click or tap zooms to 200% where it lands and another goes back to fit; the zoom buttons (on phones too) and the + / - / 0 keys zoom step by step, and pinch-zoom still works. It stays fast and sharp: WebP images, a case's screenshots load as soon as a visitor points at the case, and a screenshot can have a sharper copy that loads only when the screen needs more pixels (a Retina screen, a zoom or a pinch).
- **Statistics only with consent.** Visits, the tagged link that brought them (`?ref=` or UTM), time on page, clicks (including taps on things that do nothing, told apart from mouse clicks), zooms in the image viewer, page speed and errors are counted with [Umami](https://umami.is) only after the visitor allows it in the consent box. No cookies; with Do Not Track or Global Privacy Control on, nobody is asked and nothing loads, and Playwright checks this with the real tracker in three browsers. The [privacy page](https://karolina.kita.company/privacy) explains it and has the switch. [Visitor statistics](docs/architecture.md#visitor-statistics), [tracking plan](docs/analytics.md)
- **Quality gate.** `yarn verify` runs the typecheck, ESLint with zero warnings, a Prettier check, 1,200+ tests and the full build before every commit.

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
| `yarn e2e`             | Playwright in Chromium, Firefox, WebKit and an Android phone, production build         |
| `yarn build`           | Typecheck, build to `dist/`, then prerender every page (`yarn prerender`)              |
| `yarn preview`         | Serve the production build locally                                                     |
| `yarn lint`            | ESLint, zero warnings allowed                                                          |
| `yarn format`          | Prettier: formats files, sorts imports and Tailwind classes (`yarn format:check`)      |
| `yarn a11y`            | Accessibility audit in real Chromium; report in `a11y-report/`                         |
| `yarn favicons`        | Remakes the PNG and ICO site icons from `public/favicon.svg` (commit the files)        |
| `yarn cv-pdf`          | Remakes the CV's PDF from the /cv page (commit it with `scripts/cv-pdf.lock.json`)     |
| `yarn storybook`       | The component library (Storybook) on port 6006                                         |
| `yarn build-storybook` | Builds Storybook into `dist/storybook` (run after `yarn build`, which empties `dist/`) |

## Where things live

```
index.html                     <head>: site-wide meta, structured data, theme script
public/                        copied as-is: robots.txt, sitemap.xml, _headers, _redirects, assets/,
                               site icons (favicon.svg and its PNG and ICO copies), the CV's PDF,
                               Google Search Console's verification file (keep it)
public/assets/site/            portrait and link-preview image
public/assets/cases/<case>/    case-study screenshots and thumbnails (WebP); zoom/ holds the image viewer's sharper copies
src/app/                       shell: App, routing, section hash, SEO, hydration, prerender entry, copy tests
src/features/<name>/           one slice per page or capability (image viewer, privacy and the consent box):
                               view, components, copy (*.content.ts), types, tests
src/shared/                    ui/, layout/, media/, hooks/, lib/ (routes, ui, analytics, browser, motion, clipboard),
                               content/ (profile)
src/styles/                    tokens.css (light/dark), theme.css (Tailwind theme), app.css (entry), Figma export
e2e/                           Playwright specs and their helpers
scripts/                       prerender.ts (static HTML per page), a11y-audit.ts (checks in a11y/),
                               favicons.ts (PNG and ICO icons from the SVG), cv-pdf.ts (the CV's PDF)
docs/                          architecture, design source, motion guide (motion.md), tracking plan (analytics.md), working with Claude Code
.storybook/                    Storybook config and its Welcome page (stories sit next to their component)
.claude/                       Claude Code skills and review agents (when to use each: CONTRIBUTING.md)
```

## Editing content

Most edits are copy changes in `src/features/*/*.content.ts` (case studies in `src/features/case-studies/`). The writing rules (plain English, short hyphens, bold lead-ins on case-study bullets) are checked by `src/app/content-rules.test.ts`.

To add a screenshot to a case study, put `<name>-light.webp` and `<name>-dark.webp` (WebP, quality 90) in `public/assets/cases/<case>/` and build the card with the case's `caseShots("<case>")` helper (`src/features/case-studies/content/content.utils.ts`):

```ts
const { shot, singleShot } = caseShots("automotive");
{ ...shot("purchase-flow"), title: "...", alt: "..." }        // Light and Dark pair; the card id is "purchase-flow"
{ ...singleShot("lock-screen-live-activity"), title: "...", alt: "..." } // one version for both themes
```

The card id is the image's base name, which is also the `image` value in the statistics.

Leave room at the edges: the hover zoom hides about 1% of each side, so content (a legend, a card's border) needs padding in the file itself. `src/app/zoom-margins.test.ts` checks every case image.

For close looks in the image viewer, a screenshot can have a sharper copy: the same picture with about twice the pixels, under the same file name in a `zoom/` folder beside it (`public/assets/cases/<case>/zoom/<name>-light.webp`). The viewer finds it by itself and loads it only when the screen needs more pixels than the page's file has; the page never downloads it. `gallery.utils.test.ts` checks that each copy has its page file's shape and at least 1.5 times its width.

Images are cached for a week, so a changed image gets a new file name.

## Deploy and releases

Work happens on `develop`; `main` is the live site and changes only in a release. Every commit bumps the version and adds a `CHANGELOG.md` entry. Branches, versions and the release steps: [CONTRIBUTING.md](CONTRIBUTING.md). Netlify builds only `main`, with `yarn test:run && yarn build && yarn build-storybook`, and publishes `dist/` (Storybook at `/storybook/`); a failing test blocks the deploy. `develop` is never built or deployed.

Link previews and search results are cached by other services: after a release that changes a page's title, description, link-preview image or the site icon, refresh them with the tools listed in [CONTRIBUTING.md](CONTRIBUTING.md#5-refresh-what-other-services-cached).

## Licence

All rights reserved: the code, copy, images and design are published to be viewed, not reused. See [LICENSE](LICENSE); the notices for third-party icons and fonts are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
