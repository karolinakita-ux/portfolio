# Changelog

Newest first. Each `###` entry is one version (one commit on `develop`). Each `## Release` groups the versions that went live together on `main`, with short release notes on top. `## Unreleased` holds versions on `develop` that are not live yet.

How versions, entries and releases are written: [CONTRIBUTING.md](CONTRIBUTING.md).

## Unreleased

### 5.0.0 - 2026-10-26

#### Changed

- The project planning case study no longer names its product, whose owner has not approved it yet. Its address is now `/work/project-planning`. Its heading, Work card, page title, search copy, structured data, llms.txt and Storybook stories say "Project Planning & Cost Management Platform" or "Project Planning". The product's logo is painted out of the seven screenshots that showed it (`public/assets/cases/project-planning/`). Major version because a URL changed. The old address gets the 404 page: a redirect rule would keep the name in the public repo.
- That case's notice no longer says the screens are shared with permission. It says the name and logo were removed and that the screens show sample data. The Work page's confidentiality note no longer names it as an exception, and now speaks only of the case studies (the recommendations name their authors' companies).
- Data Governance case: the vendor's logo, product name and search placeholder are painted out of every screenshot, finishing the paint-overs some already had. The colour-blindness grid's first column is "Theme with purple colors", like the other two. Two alt texts no longer name the vendor.
- Automotive case: blurred the client's Confluence page tree in the Work thumbnail, the survey's respondents per country (also gone from the alt text), the interview quote with a dealer's sales figures, and the persona board's respondent counts, chart scales and salary. The usability results stay.
- Edited screenshots have new file names (`-v2`, or the new folder), because images are cached for a week. The unredacted originals are deleted.
- Statistics: the case's events now carry the view id `case-project-planning`; older events keep the old one.
- Older changelog entries, the README and the docs use the new name.

#### Added

- `content-rules.test.ts` fails when a published file (site, Storybook, docs, tests) names a hidden client, when a case study, its Work card or its search copy names any client, or when `public/assets/cases` holds an image no page shows (it would stay reachable by URL). The names are stored as SHA-256 hashes, so the repo does not spell them. Checked with probe files that must fail and must pass. The rule is in CLAUDE.md (Copy rules).

#### Fixed

- Eyebrows such as "Karolina Kita • Senior Product Designer" read as "Karolina Kita • , Senior Product Designer" to anything that ignores CSS and ARIA (search engines, link previews, text extractors), and copying one put the comma on a line of its own. CSS now draws the bullet (`bullet-before` in `utilities.css`), with a comma as its alternative text, so screen readers still pause there. The text in the HTML is just "Karolina Kita Senior Product Designer".
- The case thumbnails' mouse-only links had no text, so link extractors saw three empty links. Each now holds the case title as hidden text, and stays out of the Tab order and hidden from screen readers.

## Release v4.1.0 - 2026-10-23

- With your consent, visitor statistics now also measure how fast pages load and react on your device, and note errors and broken links, so problems can be fixed sooner.
- They also record your browser window size, screen pixel density and theme in ranges, and the app you opened the site in, such as LinkedIn.
- The click IDs that ads and social apps add to links are removed before anything is sent.
- The privacy policy and the consent box explain the changes, and visitors who allowed statistics before are asked again.

Versions: 4.1.0.

### 4.1.0 - 2026-10-23

#### Added

- `docs/analytics.md`, the tracking plan: principles, naming rules for events and properties, every event and session property with the question it answers, what is not collected on purpose and why, a checklist for new events, the event budget and dashboard recipes. `tracking-plan.test.ts` fails when the code sends an event or session property the plan does not list, or the plan lists one the code does not send (checked with a missing and an extra row).
- Page speed in Umami's Performance tab: the tracker's own Core Web Vitals report (`data-performance`; LCP, INP, CLS, FCP, TTFB), one per view. The tracker stays initialised with its own pageviews off (`data-auto-pageview="false"`). The section hash, same-view jumps and the first load's address go past its history wrapper (`replaceAddress()` in `shared/lib/routes/address.utils.ts`), so reading a page does not split it into many short ones; load metrics are dropped when the counted page is not the one the browser loaded.
- Session data once per page load (`umami.identify()` without an id, `session.utils.ts`): window width at the site's breakpoints, pixel density, the theme and whether it was picked, and the in-app browser (LinkedIn, Messenger, Instagram...). In-app detection moved to `shared/lib/browser` and names the app.
- New events: `storybook-click` (hero and banner), `outbound-click` (any other external `TextLink`, with its host), `image-nav` (next / previous in the image viewer, through `LightboxItem.onShow`), `text-copy` (where copied text was, never the text), `page-print`, `page-not-found` (an address that matches no page, kept by `src/main.tsx` and sent with the first pageview) and `js-error` (errors in the site's own scripts, at most three a page, harmless browser warnings left out).

#### Changed

- Addresses sent to Umami keep only `ref` and the UTM parameters, so ad and social click ids (`fbclid`, `gclid`, `li_fat_id`) never reach it, and another site's referrer loses its query. `beforeSend` (`data-before-send`) applies this to the tracker's own requests too and cancels them once statistics are off. Statistics switched off and on again on one page reuse the loaded script.
- `e2e/history.e2e.ts` records history writes on `History.prototype`, where `replaceAddress()` writes: a recorder on `window.history` (like the tracker's wrapper) no longer sees them, and the in-app browser check would have passed without looking. Unit tests for `useSectionHash`, `useHistoryRoute` and `HeadingAnchor` put a tracker-style wrapper on `window.history` and check that reading, same-view jumps and copied links pass it.
- The privacy policy lists copying and printing, window and screen, speed and errors, broken links, Storybook and other links, and the removed click ids; the consent box says it counts how fast pages load and reads the window size. Visitors who allowed statistics before this version are asked again (`STORED_CHOICE.on` is "on-3"); a no stays a no.

## Release v4.0.0 - 2026-10-23

- The CV page is gone: old CV links now open the About page.
- With your consent, visitor statistics now also count how long you stay on a page, how far you scroll and clicks or taps on things that do nothing, so the site can be clearer where visitors get stuck.
- The privacy policy and the consent box explain what is counted, and visitors who allowed statistics before are asked again.

Versions: 3.13.10 - 4.0.0.

### 4.0.0 - 2026-10-23

#### Removed

- The CV page (`/cv`) is gone: its view, route, page title, description, sitemap line, structured data and llms.txt line, and the `cv-print` statistics event. Old links (`/cv`, `/resume`, `/#resume`) open About instead: Netlify answers with a 301 (`public/_redirects`) and the app resolves them as aliases. Code that only the CV used went with it: the `Joined` component (and its story), `DOC_LINK`, `telHref`, the CV-only print classes and the `.kb-theme-light` scope in `tokens.css`. Major version because a page was removed.

### 3.14.0 - 2026-10-23

#### Added

- Visitor statistics measure time on page: `time-on-page` is sent when a visitor leaves a page, switches tabs or closes it, with the engaged time (as a dashboard group and in seconds), how far down they scrolled (in quarters) and the furthest section they reached. Time counts only while the tab is visible and the visitor was active in the last 30 s; scroll depth is read once a new view has stopped moving, so the glide to the top does not count as reading.
- Clicks and taps on things that do nothing (an image, a heading, text, a card's empty space) are counted as `dead-click`, with what was clicked, the section and a label from the site's copy (alt text, heading or card title); a burst of three or more quick clicks on one spot also sends `rage-click`. Links, buttons, drags, text selection and clicks without a pointer do not count. The design system's `Card` carries `data-card` so cards are found whatever their tag.
- Every event a click or key starts carries `input`: mouse, touch, pen or keyboard, so the dashboard tells a tap from a click.
- Every Umami call carries the site's version as its tag (`data-tag`), so the dashboard can compare releases.

#### Changed

- The privacy policy (now dated 23 October 2026) and the consent box say what is counted now. Visitors who allowed statistics before this version are asked again, because their consent covers only what they were told; a no stays a no (`STORED_CHOICE`). Unit tests, nine mutation checks (each failed the expected test) and `e2e/analytics.e2e.ts` in three browsers with the real Umami script check it, including a touch screen.

### 3.13.10 - 2026-10-22

#### Changed

- The dark value of the `bg-surface-subtle` token is gray-700 (#4a4a4a) instead of gray-600 (#6c757d), following the change in the KitaBranding design system. On gray-600, light text was below 4.5:1 (`text-primary` 4.4:1, `text-secondary` 3.6:1); on gray-700 every text token passes (`text-primary` 8.4:1, `text-secondary` 6.8:1). No component uses the token yet, so no page looks different. `kita-branding.tokens.json` is edited by hand until the Figma variable has the new value (a task on Karolina's Figma list); `tokens.test.ts` keeps it equal to `tokens.css`.

## Release v3.13.9 - 2026-10-20

- Scrolling the site inside Messenger, Instagram or LinkedIn no longer shows the app's loading bar.
- The Work page downloads much less on phones: a case study's screenshots load only when you point at or tap the case.

Versions: 3.13.8 - 3.13.9.

### 3.13.9 - 2026-10-20

#### Fixed

- Scrolling in an in-app browser (Messenger, reported on a phone; also Facebook, Instagram, LinkedIn, X, TikTok) flashed the app's loading bar on every page. The site wrote to the browser history while scrolling: one scroll on About made 4 writes (the address following three sections, then the scroll position saved after the scroll stopped). Now scroll positions stay in memory by history entry and are written only when leaving a page, and in in-app browsers (`IN_APP_BROWSER`, by user agent) the address does not follow the sections. Back and Forward still return to the same spot. Unit tests and `e2e/history.e2e.ts` (three browsers) check it; on the released build the same scroll still made the 4 writes.

### 3.13.8 - 2026-10-20

#### Changed

- Case study screenshots load when the visitor shows interest in a case: the pointer over, or keyboard focus on, a link to it (`usePreloadCaseImages`); the open case still loads its own on arrival. Before, every case's screenshots loaded in the background on any page. Lighthouse mobile on the Work page (two runs each, local production builds): 3,431 KiB and 34 images before, 441 KiB and 3 images after; score and paint times unchanged (92 - 93, FCP 2.3 s). `e2e/loading.e2e.ts` checks it in three browsers.
- Tried and left out, written down in CLAUDE.md and docs/architecture.md: a `srcset` with 640px thumbnail copies (WebKit then loads lazy images eagerly, which held up the load event and failed `e2e/motion-a11y.e2e.ts`) and a font preload (with or without `crossorigin`, WebKit or Chromium and Firefox download the font twice). `e2e/loading.e2e.ts` checks that every font downloads once.

## Release v3.13.7 - 2026-10-20

- Search engines now see Karolina's GitHub profile next to her LinkedIn as hers, which helps them connect her name with her work.
- The sitemap tells search engines that every page changed today, so they read the new versions sooner.

Versions: 3.13.7.

### 3.13.7 - 2026-10-20

#### Changed

- Site-wide structured data (`index.html`, Person `sameAs`) names her GitHub profile next to LinkedIn, and `llms.txt` lists it under Contact (`PROFILE.githubProfileUrl`). A test keeps `sameAs` equal to the PROFILE links.
- Sitemap: every `<lastmod>` is 2026-10-20 (most pages changed today, and the structured data changes on every page); its comment points at `routes.constants.ts` again. A new test requires an ISO date on every entry, never in the future; CLAUDE.md says to update a page's date when its content changes. Both new checks were proved with probes that failed.

## Release v3.13.6 - 2026-10-20

- The site is set up for Google Search Console, which shows how its pages appear in Google search and helps new pages get found sooner.

Versions: 3.13.5 - 3.13.6.

### 3.13.6 - 2026-10-20

#### Added

- A test keeps Google Search Console's verification file in `public/` exactly as issued (`src/app/seo/site-verification.test.ts`); Google rechecks it, so removing or editing it would lose the verification. Proved with a probe against a missing file, which failed.

#### Changed

- `_headers` marks the verification file `noindex`, so it never shows in search results. CLAUDE.md, README and docs/architecture.md say why the file stays.

### 3.13.5 - 2026-10-20

#### Added

- Google Search Console's verification file, `public/googlecf978c6093e1d8a5.html`, byte for byte as Google issued it (53 bytes, no line ending); the build copies it to the site root. It verifies the owner once it is live, after the next release. Pushed with `[skip netlify]`: Netlify build credits are low.

## Release v3.13.4 - 2026-10-20

- The component library opens on a welcome page that explains the design system and how it is built from Figma.
- The Behind the Design box on the Work page links the component library too, and its links have more room between them.
- "View Case Study" links are easier to click: the whole button-sized area around the text works.
- Breadcrumbs on About, Contact, CV and Privacy start with Home; case studies still start with Work.
- The statistics question links to Umami and says what it is: a visitor statistics tool.
- The theming case study uses one name everywhere: Enterprise White-Label Theme Generator.

Versions: 3.12.1 - 3.13.4.

### 3.13.4 - 2026-10-20

#### Changed

- The theming case has one product name: "Enterprise White-Label Theme Generator", as on its Work card, in search results and in the page descriptions. The page heading and the project planning case's next-case link said "Multi-Tenant Theme Customizer". "Data Governance" stays the short name (breadcrumb, tab title, URL), like "Automotive Marketplace" for the platform.

### 3.13.3 - 2026-10-20

#### Changed

- On `yarn dev` the Storybook links (Work hero and Behind the Design) open the local `yarn storybook` on port 6006, on the same host as the dev server, so unreleased stories such as the Welcome page show there. Builds, tests and deploys keep the live `/storybook/` URL (checked in the prerendered Work page); `profile.test.ts` covers both.

### 3.13.2 - 2026-10-20

#### Changed

- Link buttons ("View Case Study" and the other case-card links) have a transparent 1px border, so their click area is a bordered button's box (38 px tall with the button padding), as Karolina asked; before it was 36 px. A Button test checks it; the rule is in docs/design.md.

### 3.13.1 - 2026-10-20

#### Changed

- README: the privacy page, the Storybook library and opt-in statistics in "What is inside", 490+ tests (was 270+), `yarn build-storybook`, and an up-to-date folder map (e2e/, theme.css, the lib/ domains).
- docs/architecture.md: the privacy slice, a Visitor statistics section (consent, `track()`, what counts where), the Storybook Welcome page and banner link, Home and Work breadcrumb roots, `BUTTON_HEIGHT`, and the components the table left out.
- docs/design.md: `theme.css` (not `app.css`) maps tokens into Tailwind; new sections on components and Storybook, and on Karolina's design rules in code.

### 3.13.0 - 2026-10-20

#### Added

- Storybook opens on a Welcome page (`.storybook/Welcome.mdx`): what the KitaBranding component library is, how it comes from the Figma design system (tokens, only tokens, Figma names, light and dark), what each sidebar group holds, how to use the theme menu and the Accessibility panel, and links to the Figma file, the source, the design docs and the site (new tabs). The sidebar is ordered Welcome, Foundations, UI, Layout, Media, Patterns. Checked in the built Storybook: it opens on the page, axe finds nothing, no page errors.

### 3.12.3 - 2026-10-20

#### Added

- "Explore the Storybook Library" in the Behind the Design banner, after the GitHub link, opens the component library in a new tab, as the hero button does (`PROFILE.storybookUrl`; not counted in statistics, like the hero button). The label fits one line at 375 px.

#### Changed

- The banner's links are spaced like buttons, as Karolina asked: each link is as tall as a bordered button (`BUTTON_HEIGHT`, a new shared class list) and wrapped rows keep the buttons' gap (`gap-y-sm`, was `gap-y-xs`). The rule is in CLAUDE.md.

### 3.12.2 - 2026-10-20

#### Fixed

- Breadcrumbs on About, Contact, CV and Privacy start with "Home" instead of "Work": these pages are not part of the work. Case studies keep "Work". Same link to `/` and house icon (`HOME_CRUMB` next to `WORK_CRUMB`); the structured data (BreadcrumbList) names the root the same way. The Breadcrumb story shows both.

### 3.12.1 - 2026-10-20

#### Changed

- The consent box links "Umami" to umami.is in a new tab and says what it is: "I, Karolina Kita, use Umami, a visitor statistics tool, to see ...". The homepage explains the tool; Umami's privacy policy covers only its own visitors and customers, and its data processing agreement stays linked on /privacy. The box text is now a React node, so the test and the story check the link.

## Release v3.12.0 - 2026-10-19

- A new button on the Work page, "View Components in Storybook", opens the library of the buttons, cards and other parts this site is built from.
- The component library no longer shows a loading error when it was left open during an update.

Versions: 3.12.0.

### 3.12.0 - 2026-10-19

#### Added

- "View Components in Storybook", a secondary button after "View Code on GitHub" in the Work page hero, opens the component library in a new tab (`PROFILE.storybookUrl`, an absolute link because only production builds Storybook). A `Blocks` icon (Lucide) marks it.

#### Fixed

- Storybook: a tab opened before a deploy showed "Failed to fetch dynamically imported module" for a story whose file the deploy had renamed. The preview now reloads once on Vite's `vite:preloadError` (at most once in 10 s); checked by serving one build, switching to another under the open tab and opening Section's docs. All 79 live entries render.

## Release v3.11.3 - 2026-10-19

- The statistics question uses the site's calm outlined buttons again; both answers still look exactly the same.

Versions: 3.11.2 - 3.11.3.

### 3.11.3 - 2026-10-19

#### Changed

- The consent box's two answers are secondary buttons again, still identical: the page keeps its one primary (yellow) action, and the raised card already makes the box stand out. The layout and text from 3.11.1 stay.

### 3.11.2 - 2026-10-19

#### Changed

- On the dev server (`yarn dev`) the consent box shows on every page load, whatever was chosen before, so its design can be checked; an answer hides it until the next load, and Umami never loads there. Automated browsers (Playwright e2e, `yarn a11y`) do not get it.

#### Fixed

- With storage blocked, an answer in the consent box now hides it for the page instead of the box staying open.

## Release v3.11.1 - 2026-10-19

- The statistics question shows "Allow statistics" and "No, thanks" as two equal buttons, and says that you can change your choice at any time on the Privacy page.
- The Privacy page explains more precisely how Google handles emails sent to Gmail.

Versions: 3.11.1.

### 3.11.1 - 2026-10-19

#### Changed

- The consent box: "Allow statistics" and "No, thanks" are both primary buttons, so the choice stands out and neither answer is pushed (EDPB cookie banner taskforce, para. 13 and 17). "Privacy details" moves to the end of the row, below the buttons on phones. The story checks that both buttons look the same.

#### Fixed

- The consent box names who asks and says that the choice can be changed at any time on the privacy page: both belong to valid consent (EDPB Guidelines 05/2020 on consent, para. 64; GDPR Art. 7(3)).
- The privacy page no longer says that every company in the list processes data for Karolina: with a free Gmail account, Google handles mail under its own privacy policy.

## Release v3.11.0 - 2026-10-19

- A new Privacy page, linked from the footer, says who runs the site, which services receive data (hosting, statistics, email) and what your rights are.
- The site can count visits with Umami, a statistics tool without cookies, but only after you allow it in a short box; "No, thanks" is just as easy.
- You can switch statistics on or off at any time on the Privacy page, and the site respects Do Not Track and Global Privacy Control.
- Behind the scenes: the code follows the Figma components more closely, and each shared part has its own tested example.

Versions: 3.8.0 - 3.11.0.

### 3.11.0 - 2026-10-19

#### Added

- Storybook 10 for the component library: a story for every shared component (buttons, badges, cards, callouts, dialog, accordion, links, header, footer, theme toggle, images) and the consent box, with the Figma variants, real copy and a light/dark toolbar. `yarn storybook` runs it on port 6006.
- `src/test/stories.test.tsx`: every story renders in Vitest, runs its interaction checks and passes axe (WCAG 2.1 A/AA); a shared component without a story fails the test.
- Production deploys build Storybook into `/storybook/`: a separate build, so the site's pages load none of it, with `noindex, nofollow` and no link from the site. Branch deploys skip it.

#### Changed

- `react` and `react-dom` are pinned to one copy with yarn `resolutions` (Storybook's docs addon pulled in a second one).

### 3.10.0 - 2026-10-19

#### Added

- A consent box for visitor statistics on the live site: "Can I count your visit?" with "Allow statistics" and "No, thanks" side by side and a link to the privacy page. Umami's script loads only after "Allow". It is not shown with Do Not Track or Global Privacy Control, on other hosts, or once the visitor has decided (kept in `kb-statistics`).

#### Changed

- Statistics need consent: Umami's script reads screen size and language and sends them, which needs prior consent under Art. 5(3) of the ePrivacy Directive (EDPB Guidelines 2/2023, para. 33) and Art. 399 of the Polish Prawo komunikacji elektronicznej, cookies or not. The EU's planned exemption for audience measurement (Digital Omnibus) is still in committee.
- The privacy page names consent as the legal basis for statistics, adds the right to withdraw it, and its switch now allows or switches off statistics.

### 3.9.0 - 2026-10-19

#### Added

- A Privacy page (`/privacy`), linked from the footer: who is responsible, hosting logs (Netlify), visitor statistics (Umami), email, cookies and storage, who receives data and under which transfer rules, the visitor's rights with the right to object shown on its own, the complaint address of UODO, and the date of this version. Facts checked against Netlify's and Umami's data processing agreements, Google's framework page and uodo.gov.pl.
- A switch on that page that turns visitor statistics off for the browser (Umami's own `umami.disabled` key): counting stops at once, and the script no longer loads.
- `InfoTable` / `InfoTableCell` (Figma: Info Table) and `TextLink` in `shared/ui`; a reading-width token `--container-reading`.

#### Removed

- The privacy section on the Contact page (unreleased; the page replaces it).

### 3.8.2 - 2026-10-19

#### Added

- A component library in `src/shared/ui`, named after the Figma components: `Card` (layout stack / media, gap), `Badge`, `Avatar`, `PageTitle`, `Dialog` (the native modal: inert page, Escape, backdrop click, scroll lock), `Accordion` / `AccordionItem`, `VisuallyHidden` and `NewTabNote`. `docs/architecture.md` maps each Figma component to its code.
- `clsx` for composing classes and `cva` (class-variance-authority) for variant sets: Button `variant`, Callout `tone`, Card `layout` and `gap`, Badge `weight`, Section `gap`, the engagement tier.

#### Changed

- Repeated markup now uses the library: six hand-written card class lists become `Card`, the four page titles `PageTitle`, the skill tags and detail badges `Badge`, seven "(opens in a new tab)" spans `NewTabNote`, new-tab attributes `EXTERNAL_LINK`, link styles `TEXT_LINK`. The image viewer runs on `Dialog`, the FAQ on `Accordion`.
- `isCaseView()` replaces three copies of the case-study check.
- The dialog backdrop CSS moved to `dialog.css` as `.kb-dialog`.

#### Removed

- The project's own `cn()`; `clsx` does the same. `tailwind-merge` stays out: it reads token type styles (`text-body-md`) as colours and drops them.

### 3.8.1 - 2026-10-19

#### Changed

- One component per folder: `Button/Button.tsx` with `Button.types.ts` (props), `Button.styles.ts` (all its Tailwind classes) and `Button.test.tsx`. Views and their sections are split the same way in every feature; the image viewer's dialog is split into hooks (`useZoom`, `useSwipe`, `useModalDialog`, `usePreloadNeighbours`, `useRevealedImage`) and smaller components.
- Mixed modules are split by role and grouped in one folder per domain: `shared/lib/routes/` (constants, types, utils), `lib/analytics/`, `lib/ui/`, `lib/motion/`, `hooks/theme/`, `media/image-preload/`, the case-study `content/` and `gallery/`, `app/routing/`, `app/seo/`.
- `app.css` is split into `theme.css`, `utilities.css`, `base.css`, `lightbox.css` and `motion.css`; `e2e/helpers.ts` into `e2e/helpers/`; the accessibility audit into `scripts/a11y/`.
- Prettier sorts classes inside `cn()`; ESLint rejects class strings in `className` and files over 200 lines of code (tests and copy excepted).
- `CLAUDE.md`, `CONTRIBUTING.md` and `docs/architecture.md` describe the file rules, the co-author trailer for engineering commits and a list of recurring pitfalls.

#### Fixed

- The ESLint slice boundaries never matched: in gitignore-style patterns a leading `#` starts a comment, so `"#app/*"` matched nothing. They are regular expressions now, and a slice may import its own files across folders but no other slice. No code had crossed them.

The built pages and CSS are the same as in 3.8.0 (compared page by page).

### 3.8.0 - 2026-10-19

#### Added

- Visitor statistics with Umami Cloud, on the live site only: no cookies and nothing stored on the visitor's device. The script loads from code (`src/shared/lib/analytics.utils.ts`) only for a production build served from karolina.kita.company, never in dev, on branch deploys or in the claude.ai artifact, and not for visitors with Do Not Track or Global Privacy Control.
- One pageview per page, sent by the app: first load and every view change, Back / Forward included; section jumps and the scroll-following hash are not counted, and addresses go without the hash.
- 12 typed click events: case-open, case-nav, image-open, figma-click, github-click, linkedin-click, email-click, cv-print, faq-open, section-link-copy, theme-switch, and link-ref for tagged links (`?ref=acme`).
- A Privacy section on the Contact page (`/contact#privacy`), linked from the footer: what is counted, the vendor, 6 months of history, the legal basis, tagged links, how to opt out and the visitor's rights.
- `e2e/analytics.e2e.ts`: serves the build as the live site with the real Umami script, catches every call to Umami's collector and checks events, addresses, cookies and storage; no script on other hosts or with Global Privacy Control.

#### Changed

- The CV's portfolio link ends in `?ref=cv`, so visits from the CV show up as tagged.
- Each case study names its own view (`view` in the case content); the content tests check it against the screenshot folder.

## Release v3.7.3 - 2026-10-14

- The yellow marker in the menu now slides to the page you open, and the light / dark switch moves the same way.
- Switching between light and dark mode fades the whole page instead of jumping.
- Cards on the Work, About and case study pages fade in gently as you scroll to them.
- Motion stays short and calm, and it switches off when your device asks for reduced motion; keyboard focus outlines appear at once.

Versions: 3.5.1 - 3.7.3.

### 3.7.3 - 2026-10-14

#### Changed

- `CLAUDE.md`: focusable elements list the properties they transition (`transition-[color,background-color]`), because `transition-colors` also animates the outline and makes the focus ring fade in.

### 3.7.2 - 2026-10-14

#### Fixed

- Keyboard focus rings appear at once in their final colour. The menu links, theme buttons, the copy-email button and the FAQ questions animated their outline colour together with their text colour, so the ring faded in over up to 240ms and started almost invisible on the yellow marker in dark mode.
- The scroll fade on cards stays off with forced colours (Windows high contrast) or when the visitor asks for more contrast.
- The loading skeleton on thumbnails pulses twice and then holds still, so nothing on the site loops longer than 5 seconds (WCAG 2.2.2).
- `yarn a11y` reads each Tab stop's focus style after it settles, so its Tab report shows the real ring.

#### Changed

- Tests: a Playwright `motion-a11y` spec checks that no focusable element animates its outline, that every timed animation ends within 5 seconds while images are still loading, and that the scroll fade respects both contrast settings. These fixes come from a WCAG 2.1 AA review of the motion work, which found no AA failures.

### 3.7.1 - 2026-10-14

#### Fixed

- The header motion test "a second click mid-way" no longer fails now and then in WebKit. WebKit starts a new animation from the last painted frame, so under load the first move could already be over before the test paused it; the test now holds the move the moment the app starts it (new `nextPillAnimation` helper). 400 of 400 runs passed under the load that failed it before.

### 3.7.0 - 2026-10-14

#### Added

- Cards fade up as they scroll into view: the case cards and testimonials on Work, the principle and career cards on About, and the screenshot rows and problem cards in the case studies. The fade follows the scroll position (a CSS scroll-driven animation, no script): it starts when a card's top enters the screen and ends 96px of scrolling later. Nothing moves on the first screen, with reduced motion or in print, and browsers without support (Firefox today) simply show the cards.

#### Changed

- Tests: Vitest checks the CSS guards and exactly which cards carry the fade; a Playwright `scroll-reveal` spec checks every card while scrolling at 390 and 1280 px, the first screen on load, anchor jumps, reduced motion, print, Firefox, and axe at several scroll positions in both themes.

### 3.6.0 - 2026-10-14

#### Added

- The yellow marker in the header moves: when the page changes, it slides from the old menu item to the new one (240ms, standard easing), whether the change came from the menu, a link on the page, the footer or Back / Forward. The light / dark switch slides the same way. To or from the CV, which is not in the menu, the marker fades out or in. Nothing moves on the first page load or with reduced motion.
- A theme change cross-fades the page where the browser supports view transitions. In older browsers every colour changes in the same frame, so the header no longer lags behind the page.
- In Windows high-contrast mode the active menu item and the selected theme keep a visible outline.

#### Changed

- Menu and theme labels change colour together with the marker (240ms), so their hover background fades at that speed too.
- Tests: Vitest for the sliding marker, the motion token reader, the header and the theme change; a Playwright `header-motion` spec in three browsers (travel, interruption, fade in and out, first load, reduced motion, cross-fade and its fallback, high contrast).

### 3.5.4 - 2026-10-14

#### Added

- End-to-end tests with Playwright: `yarn e2e` runs them in Chromium, Firefox and WebKit against a fresh production build with prerendered pages. A smoke test opens every page (the right title, one `<main>` and one `<h1>` before and after React takes over, no console errors).
- A theme test checks that the site follows the system light / dark setting at first paint and after React, follows live system changes, keeps a visitor's pick (also after a reload) and still works when storage is blocked.
- `CLAUDE.md`, `CONTRIBUTING.md` and the README describe `yarn e2e`: run it after UI, motion or theme changes. It is not part of `yarn verify` or the Netlify build.

### 3.5.3 - 2026-10-14

#### Changed

- Motion has design tokens: `motion/duration/fast`, `medium` and `slow` (150, 240 and 300ms) and `motion/easing/standard` in Figma, exported to `kita-branding.tokens.json` and declared once in `tokens.css` (they are the same in both modes). The KitaBranding design system on claude.ai has them too.
- Every transition and animation uses them through `duration-fast|medium|slow` and `ease-standard`; Tailwind's own easings are switched off. A new test (`motion-tokens.test.ts`) fails on a raw duration, delay or easing, and `tokens.test.ts` checks the motion tokens against Figma in both modes.
- Small visible change: four transitions that took 200ms (FAQ chevron and answer, header shadow, back to top) now take 240ms, and eight transitions without an easing use the standard easing instead of Tailwind's default.
- Tailwind reads class names from `src/` only, without test files, so utilities quoted in tests and docs no longer end up in the site's CSS.
- `CLAUDE.md` and `docs/design.md` describe the motion tokens and where they are mirrored.

### 3.5.2 - 2026-10-13

#### Fixed

- One-page builds with a relative base (`vite build --base ./`, used for the claude.ai artifact copy of the site) work again: there the page path travels in the hash (`#/about`, `#/about#career`), because such a build has no other paths to load. The site itself is unchanged.

### 3.5.1 - 2026-10-13

#### Changed

- `package.json` is named `portfolio` like the repository and links to it; `CLAUDE.md` names the public repo.
- Docs and comments follow the latest changes: what `yarn verify` runs, where `## Unreleased` goes after a release, and that only a new view remounts (a jump within a page only scrolls).

## Release v3.5.0 - 2026-10-13

- The code behind the site is now public on GitHub, linked from the Work page next to the Figma workspace.
- Every page has its own address, such as /about or /work/automotive, and old links still open the right page.
- Every section heading has a link icon that copies a link to that section, and the address bar follows the section you are reading.
- Pages load faster and show up better in search results, link previews and AI assistants: images are about three times smaller, and every page arrives ready to read.
- Screenshots in the automotive case study no longer show client names.
- "Explore Case Studies" now scrolls smoothly to the case studies, without a flicker.

Versions: 2.0.2 - 3.5.0.

### 3.5.0 - 2026-10-13

#### Added

- The code is public: "View Code on GitHub" in the Work page hero and "Explore the Code on GitHub" in the Behind the Design banner open the repository at github.com/karolinakita-ux/portfolio.

### 3.4.1 - 2026-10-13

#### Changed

- "Behind the Design" banner: more space between the text and its links (16px instead of 12px).

### 3.4.0 - 2026-10-13

#### Added

- The "Behind the Design" banner on the Work page links the code on GitHub next to the Figma workspace, both with their brand icon. Like the hero button, the GitHub link shows once the repository is public.

#### Fixed

- "Explore Case Studies" no longer makes the page flicker: a jump within the same page now only scrolls smoothly to the section, without re-rendering and fading in the whole page.

### 3.3.1 - 2026-10-13

#### Added

- `LICENSE`: all rights reserved. The code, copy, images and design can be viewed and linked, not reused without Karolina's written permission. `THIRD-PARTY-NOTICES.md` keeps the Lucide (ISC) and Feather (MIT) notices for the icons.
- Claude Code setup in `.claude/`: the `/release` and `ship-change` skills and two review agents (`a11y-reviewer`, `copy-reviewer`).
- `docs/architecture.md` (layers, routing, prerendering, images, adding a page) and `docs/claude-code.md` (how the site is built with Claude Code).

#### Changed

- README rewritten for visitors: what the project shows, how to run it, where things live, how to edit content.
- `package.json` marks the project as `UNLICENSED` (not open source).

#### Removed

- The unused `lucide-react` package: the icons are drawn locally.

### 3.3.0 - 2026-10-13

#### Added

- A "View Code on GitHub" button next to the Figma workspace on the Work page. It stays hidden until the repository is public: set `PROFILE.repositoryUrl` to switch it on.

### 3.2.0 - 2026-10-13

#### Changed

- Images are sorted into folders: `/assets/site/` and `/assets/cases/<case>/`, with shorter names (`cases/automotive/thumbnail.webp`).
- Screenshots are WebP instead of PNG: 3.7 MB of images instead of 11.7 MB, at the same size in pixels and with sharp text. The link-preview image stays PNG.
- Fonts (Inter, Zilla Slab) are served from the site itself instead of Google Fonts: one less connection before text appears, and no visitor data goes to Google.
- Browsers keep images for a week; the About portrait loads first.

#### Removed

- Four images no page used (two dark link-preview variants, a light one, and an early palette screenshot of the project planning case).

### 3.1.0 - 2026-10-13

#### Added

- Every page is prerendered to its own HTML file at build time (`scripts/prerender.ts`), so search engines, link previews, recruiting tools and AI assistants read the full content without running JavaScript. The app then takes over as before.
- Each page has its own title, description, canonical address, link-preview tags and structured data: a profile page for Work, About and CV, and each case study as Karolina's creative work, with breadcrumbs.
- `/llms.txt`: a short, plain-text map of the site for AI assistants, built from the site's own copy.
- `robots.txt` names the main AI crawlers and assistants as welcome.

#### Changed

- Unknown addresses return a real 404 status (the page shows Work) instead of the Work page with status 200; `/work` redirects to `/`.
- The first page no longer fades in, because it is already on screen as HTML.
- The "needs JavaScript" fallback note is gone: the content is there without it.

### 3.0.0 - 2026-10-13

#### Changed

- Every page has its own address instead of `/#about` and similar: `/about`, `/contact`, `/cv`, `/work/data-governance`, `/work/automotive` and one for the project planning case. Old links keep working: they open the right page and the address bar shows the new address.
- The sitemap lists all seven pages, so search engines can index each one.
- View ids, page paths and section anchors live in one place (`VIEW`, `VIEW_PATHS`, `SECTION` in `src/shared/lib/routes.ts`) instead of repeated strings.

#### Added

- Every section heading has a link icon (on hover, keyboard focus, and always on touch screens). Clicking it copies a link to that section, such as `/about#career`, and announces "Link copied".
- While you scroll, the address bar follows the section you are reading, so copying the address shares that spot. A link with a section opens the page at that section.

### 2.0.4 - 2026-10-13

#### Changed

- Stricter, current lint setup: typescript-eslint strict and stylistic type-checked rules, `@eslint-react`, `jsx-a11y`, Vitest, Testing Library and jest-dom rules, and import boundaries between app, features and shared code. `yarn verify` now fails on any lint warning and on unformatted files.
- Prettier sorts imports by layer; `.editorconfig` sets the same basics for every editor.
- React 19 context syntax (`<Context value>`), keys on the CV's inline links, the logo links to `/`, and clearer test helpers.
- `package.json` names Karolina as the author and the site as the homepage.

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

- Quoted Polish UI labels in the project planning case study (21 phrases, e.g. "Koszt opóźnień") are marked `lang="pl"`, so screen readers pronounce them in Polish (WCAG 3.1.2). New `Lang` inline component in `ui/text.tsx`; a content test fails if Polish letters appear outside it.

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
- Three case studies, each with its screenshots: Automotive B2B Marketplace Redesign, Project Planning & Cost Management Platform and Enterprise White-Label Theme Generator.
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
- Work, About and case-study pages for the theming system, project planning and automotive projects.
- KitaBranding design tokens (light and dark) kept in sync with the Figma export by tests.
- Case-study images, Work page thumbnails, portrait and Open Graph image in `public/assets/`.
- New favicon.
- Netlify config: tests run before every build, hashed bundles cached for a year, security headers.

#### Changed

- The benchmarking card in the automotive case study uses `automotive-competitive-benchmarking-notes.png`.
