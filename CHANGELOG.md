# Changelog

Newest first. Each `###` entry is one version (one commit on `develop`). Each `## Release` groups the versions that went live together on `main`, with short release notes on top. `## Unreleased` holds versions on `develop` that are not live yet.

How versions, entries and releases are written: [CONTRIBUTING.md](CONTRIBUTING.md).

## Release v1.1.0 - 2026-10-09

- Case-study screenshots can be zoomed up to 400% on computers and tablets, with buttons or the + and - keys, and moved around by dragging. Phones keep their own pinch-zoom.
- Clearer search results and link previews: a better page description, and profile details that help Google show who Karolina is.

Versions: 1.0.3 - 1.1.0.

### 1.1.0 - 2026-10-09

#### Added

- Zoom in the image viewer on screens 768 px and wider: Zoom out / Zoom in buttons and the + / - / 0 keys, from Fit to 400%. Phones keep their own pinch-zoom.
- Zoomed images move by mouse drag, scrolling, or the arrow keys when the image has focus. The middle of the view stays put when zooming or resizing the window.
- Below 768 px a zoomed image goes back to Fit, since the zoom controls hide there.
- `playwright` dev dependency, for checking the site in a real browser.

#### Changed

- Icon buttons have a greyed-out style for limits such as maximum zoom, and keep keyboard focus there.

### 1.0.4 - 2026-10-09

#### Added

- `develop` / `main` branch workflow, release process and release notes guide in `CONTRIBUTING.md`.

#### Changed

- Changelog groups versions into releases; versions waiting for a release sit under Unreleased.

### 1.0.3 - 2026-10-09

#### Added

- Structured data (JSON-LD) in `index.html`: Person, ProfilePage and WebSite, with education, credentials, skills and LinkedIn.
- `robots.txt` and `sitemap.xml`.
- `robots` meta allowing large image previews in search results.
- Short summary and case-study names in the `<noscript>` fallback, for crawlers that do not run JavaScript.

#### Changed

- Meta, Open Graph and X descriptions now name the role, 8+ years, B2B and enterprise focus, UX research, design systems and the MSc in Psychology.

## Release v1.0.2 - 2026-10-09

First release of the rebuilt portfolio.

- The portfolio is rebuilt from scratch, with Work, About, Contact, CV and cover letter pages, light and dark mode.
- Three case studies: Automotive B2B Marketplace Redesign, Project Planning and the Enterprise White-Label Theme Generator, each with its screenshots.
- New favicon and link preview image for LinkedIn, Slack and other apps.
- Large screenshots are resized so case studies load faster (the biggest went from 32 MB to 1.6 MB).

Versions: 1.0.0 - 1.0.2.

### 1.0.2 - 2026-10-09

#### Changed

- Resized `automotive-hifi-screens-documentation.png` from 14370 px to 4000 px wide (2.9 MB to 0.8 MB). The 1.0.1 commit message listed this change, but the file was missing from that commit.

### 1.0.1 - 2026-10-09

#### Changed

- Resized `automotive-prototype-audit-tracker.png` from 20274 px to 3000 px wide (32 MB to 1.6 MB).

#### Added

- This changelog.

### 1.0.0 - 2026-10-09

#### Added

- Portfolio rebuilt in React 19, TypeScript and Tailwind v4 on Vite, replacing the Vite starter.
- Work, About and case-study pages for the theming system, Project Planning and automotive projects.
- KitaBranding design tokens (light and dark) kept in sync with the Figma export by tests.
- Case-study images, Work page thumbnails, portrait and Open Graph image in `public/assets/`.
- New favicon.
- Netlify config: tests run before every build, hashed bundles cached for a year, security headers.

#### Changed

- The benchmarking card in the automotive case study uses `automotive-competitive-benchmarking-notes.png`.
