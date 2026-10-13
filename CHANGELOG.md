# Changelog

Newest first. Each `###` entry is one version (one commit on `develop`). Each `## Release` groups the versions that went live together on `main`, with short release notes on top. `## Unreleased` holds versions on `develop` that are not live yet.

How versions, entries and releases are written: [CONTRIBUTING.md](CONTRIBUTING.md).

## Unreleased

### 2.0.3 - 2026-10-13

#### Changed

- Code is organised in vertical slices: `src/app/` (shell and routing), `src/features/<name>/` (work, about, contact, cv, case-studies, image-viewer: each with its view, copy, types and tests) and `src/shared/` (ui, layout, media, hooks, lib). The app imports a feature only through its `index.ts`.
- Imports use subpath aliases from `package.json`: `#app/*`, `#features/*`, `#shared/*`, `#test/*`.
- Files are named by role: `*.content.ts` for copy, `*.types.ts`, `*.constants.ts`, `*.context.ts`, `*.utils.ts`. The one shared types file is split per feature.
- No visible change on the site.

### 2.0.2 - 2026-10-13

#### Added

- `docs/design.md`: the Figma design source and how its variables become the site's tokens.

#### Changed

- `.gitignore` keeps private and local files out of the repo before it goes public: Claude Code local files, notes, private docs (`docs/_*`), documents such as CVs and cover letters, design sources, archives, test output and key files. ESLint skips the same local folders.
- README describes the project for visitors and links the design doc; the stale image setup step is gone.
- The release rule in CONTRIBUTING names Karolina only.

#### Removed

- Six unused automotive screenshots from `public/assets/` that showed client names or internal project material. No page used them, but the live site still served them by URL until the next release.
- A personal detail from the 2.0.0 changelog entry, and cover letter mentions left in code comments.

#### Fixed

- The phone number test uses a made-up number.

## Release v2.0.1 - 2026-10-12

- Two new buttons under the Work page intro lead to the case studies and to Karolina's Figma workspace.
- Case-study thumbnails on the Work page open their case study, and recommendations link to their authors and companies on LinkedIn.
- The header takes one slim row on computers and no longer covers the page on short screens.
- Screenshots open at once in the image viewer, which moves more smoothly and stays usable at high browser zoom.
- Better accessibility for keyboard and screen reader users, including a clearer focus outline in dark mode and screenshot descriptions that match the images.
- The separate cover letter page has been removed.

Versions: 1.2.2 - 2.0.1.

### 2.0.1 - 2026-10-12

#### Changed

- Header on desktop (768 px and up) is one row: logo, Work / About / Contact centred, theme switch on the right. It is 67 px instead of 115 px (7-9% of a laptop screen instead of 13-16%) and keeps that height while scrolling, so nothing jumps.
- Header on phones keeps two rows with tighter spacing: 103 px instead of 115 px.
- Header background is opaque instead of see-through, so page text no longer shows faintly behind it (NN/g guidance on sticky headers).
- Tab order in the header follows the desktop layout: logo, nav, theme switch.

#### Fixed

- On short screens (under 480 px tall: phones in landscape, or 200-400% browser zoom) the header no longer sticks, so it cannot cover up to 40% of the screen. Anchor jumps then stop reserving space for it.

### 2.0.0 - 2026-10-12

#### Removed

- The cover letter page (`#cover-letter`, alias `#letter`). It was not in the menu or the sitemap, and a cover letter is written per application anyway. Old links now open the Work page. Removed with it: `src/content/cover-letter.ts`, `CoverLetterView`, the `CoverLetter` type, the letter print page (`@page cover-letter`, `p-letter`, `page-cover-letter`, `min-h-a4`), `formatLongDate` and the one-page fit check (`lib/pageFit.ts`), which only the letter used.

### 1.6.0 - 2026-10-12

#### Added

- Case-study thumbnails on the Work page open their case study on click or tap (pointer cursor, border darkens and the image zooms slightly on hover; Ctrl / middle click opens a new tab). Keyboard and screen reader users keep the single "View Case Study" link: the thumbnail link is out of the Tab order and hidden from assistive tech, and the image alt text is still read.

### 1.5.0 - 2026-10-12

#### Added

- Recommendations on the Work page link to LinkedIn: each author's name opens their profile and the company name opens its company page (Stewart Wilson, Precisely; Gavin Harvey, Cox Automotive), with the external-link icon and a 24 px minimum tap height. A secondary button under the quotes, "Read the full recommendations on LinkedIn", opens Karolina's recommendations page. All open in a new tab and say so to screen readers.

#### Changed

- Testimonial content splits the job title and the company (`role`, `company: { name, url }`) and adds `profileUrl`; the page still shows "Role | Company". `PROFILE.linkedinRecommendationsUrl` holds the recommendations link.

### 1.4.3 - 2026-10-12

#### Changed

- Whole repo formatted with Prettier (`yarn format`): line breaks, trailing commas, sorted Tailwind classes, self-closing tags in `index.html` and `0.10` written as `0.1` in `tokens.css`. No behaviour changes; `yarn verify` and `yarn a11y` pass, and `prettier --check .` is clean.

### 1.4.2 - 2026-10-12

#### Changed

- Prettier formatting in `src/lib/dates.ts`, `src/lib/routes.test.ts` and `src/lib/ui.ts` (line breaks and trailing commas only, no code changes).

### 1.4.1 - 2026-10-12

#### Changed

- Tests for the 1.4.0 image loading: the viewer's "Image unavailable" state, a failed decode, and a late decode of the previous image after browsing on; the preloader waiting for page load, its Safari fallback (no idle callback), moving on after a failed image, and skipping 2G; the size manifest's values; screenshot order per case; `useCaseGallery` passing sizes to the viewer; and the app queuing all three case studies.

### 1.4.0 - 2026-10-12

#### Added

- Case-study screenshots now open at once in the image viewer. After the first page has loaded and the browser is idle, every case study's full screenshots load in the background (two at a time, the open case study first). Opening the viewer also loads the images on either side first, so Previous / Next and swipes do not wait. Nothing preloads when the visitor has data saver on or a 2G connection.
- Loading skeleton in the image viewer for an image that has not arrived yet: a box of the image's final size and shape with the pulsing wireframe used for page thumbnails, in light and dark. The image replaces it once decoded, and zoom waits until then. Image sizes come from a build-time manifest (`virtual:asset-sizes` in `vite.config.ts`, read from the PNG headers in `public/assets`).

### 1.3.1 - 2026-10-12

#### Fixed

- Images load in a relative build (`vite build --base ./`, used for the claude.ai artifact copy): `main.tsx` builds the image path from Vite's base instead of a fixed `/assets`. The site build still uses `/assets`, so nothing changes on the live site.

### 1.3.0 - 2026-10-12

#### Added

- Two buttons under the Work hero intro: "Explore Case Studies" (primary, down arrow) glides to the case studies and moves focus to their heading, and "Inspect Figma Workspace" (outlined, Figma icon, opens in a new tab).
- Footer note under the copyright: "Designed in Figma, prototyped & built with Claude AI assistance".

#### Changed

- Anchor navigation with the `smooth` option now glides to the anchor too, not only to the top (still a jump with reduced motion).

### 1.2.10 - 2026-10-12

#### Fixed

- `yarn a11y`: the emulated screen reader no longer reads the `<noscript>` fallback (real browsers with JavaScript do not expose it), and the Tab walk waits for the app to finish moving focus after a page loads and skips script-focused elements (`tabindex="-1"`), so `<main>` is no longer reported as a stop without a focus style.

### 1.2.9 - 2026-10-12

#### Fixed

- Copy email fallback: when the browser blocks the clipboard, the "Selected - press Ctrl+C or Command+C" instruction now stays until focus leaves the button instead of disappearing after 2 seconds, and uses words instead of the ⌘ symbol, which screen readers cannot say.
- On case studies the header nav marks Work as the current section (`aria-current="true"`), so only the breadcrumb announces the case study as the current page.

### 1.2.8 - 2026-10-12

#### Fixed

- Four automotive screenshot descriptions now say what the image shows (WCAG 1.1.1): the survey data quality table (7 of 8 markets, responses per country), the franchise dealer research board for Poland, the service provider persona, and the Visibility of System Status audit slide. The survey card copy ("6 European markets", including the UK) still differs from the image and is waiting for Karolina.
- 1.2.7 entry: the focus ring change is also done in Figma.

### 1.2.7 - 2026-10-12

#### Fixed

- Dark theme focus ring is easier to see: `borderInteractiveFocus` (dark) changes from #5c6bc0 to #9fa8da, the dark link colour. Lowest contrast against the background behind a focused control goes from 2.91:1 to 6.13:1 (WCAG 1.4.11 needs 3:1). Updated in Figma (dark `border/interactive/focus` now points at Denim/denim-200), `kita-branding.tokens.json` and `tokens.css`.

### 1.2.6 - 2026-10-12

#### Fixed

- Image viewer on short screens and at 200-400% browser zoom: the image no longer shrinks to a thin strip or disappears. It keeps a 12rem minimum height and the viewer scrolls instead, without cutting off its top (WCAG 1.4.10).
- Zoom buttons and the + / - / 0 keys now also work with a mouse or trackpad below 768 px, so desktop users with browser zoom can still enlarge screenshots (WCAG 1.4.4). Touch screens below 768 px keep their own pinch-zoom.

### 1.2.5 - 2026-10-12

#### Fixed

- Image viewer: when zoom returns to Fit (0 or - key) while the zoomed image has focus, focus moves to Zoom in instead of dropping to the page, so the keys keep working. When the window narrows below 768 px, focus moves to Close (WCAG 2.4.3).

#### Changed

- `IconButton` accepts a `ref`.

### 1.2.4 - 2026-10-12

#### Fixed

- Quoted Polish UI labels in the Project Planning case study (21 phrases, e.g. "Koszt opóźnień") are marked `lang="pl"`, so screen readers pronounce them in Polish (WCAG 3.1.2). New `Lang` inline component in `ui/text.tsx`; a content test fails if Polish letters appear outside it.

### 1.2.3 - 2026-10-12

#### Fixed

- Back to top stays visible while it has keyboard focus. Before, pressing Home on it scrolled to the top and hid the button with focus still on it, so focus was invisible (WCAG 2.4.7).

### 1.2.2 - 2026-10-09

#### Changed

- Image viewer: the next image slides in from the right and the previous one from the left, and the dimmed backdrop fades in with the panel.
- Icon buttons press in slightly when tapped or clicked, since touch screens show no tap highlight.
- Thin scrollbars in the border colour in the zoomed image.

#### Fixed

- The image viewer kept moving its Previous / Next buttons as image heights changed (up to 167 px), so quick taps or clicks could hit the backdrop and close it. The image area now has a fixed height, which also stops the panel growing when zooming in.
- Quick taps on buttons and links no longer zoom the page on touch screens (double-tap zoom). Pinch-zoom still works.
- A downward swipe in the open image viewer no longer pulls to refresh the page behind it.

## Release v1.2.1 - 2026-10-09

- Swipe left or right in the image viewer to browse screenshots on phones and tablets.
- Automated accessibility checks now cover every page in light and dark mode.

Versions: 1.2.0 - 1.2.1.

### 1.2.1 - 2026-10-09

#### Added

- `yarn a11y`: accessibility audit in real Chromium for every page in light and dark mode, at phone and desktop width. Runs axe (WCAG 2.0 / 2.1 A and AA), an emulated screen reader transcript, Tab order with focus styles, a 320 px reflow check and image viewer focus checks. Report in `a11y-report/` (not committed).
- `@axe-core/playwright` and `@guidepup/virtual-screen-reader` dev dependencies.

### 1.2.0 - 2026-10-09

#### Added

- Swipe left or right in the image viewer to go to the next or previous image on touch screens. Ignored while zoomed, while the page is pinch-zoomed, and for two-finger gestures.
- The viewer hint reads "Swipe to browse" on touch screens, also on phones, instead of the arrow-key hint.

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
