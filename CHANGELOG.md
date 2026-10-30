# Changelog

Newest first. Each `###` entry is one version (one commit on `develop`). Each `## Release` groups the versions that went live together on `main`, with short release notes on top. `## Unreleased` holds versions on `develop` that are not live yet.

How versions, entries and releases are written: [CONTRIBUTING.md](CONTRIBUTING.md).

## Unreleased

### 5.14.8 - 2026-10-30

#### Changed

- Automotive: one name, Marketplace, as Karolina chose. The page heading is now "Automotive B2B Marketplace: From Dealer Research Across Europe to a Validated Redesign" (also in the previous / next links) and the browser tab "Automotive Marketplace Case Study", like the Work card, the breadcrumb and the search data. "7 European markets" stays.
- Theme Generator (the Data Governance case): the breadcrumb and the browser tab say "Theme Generator", the product the Work card, the heading and the search data name. The address `/work/data-governance` stays, so shared links keep working.
- Tests: a new check keeps each case's browser tab equal to its breadcrumb name and every word of that name in its heading.

### 5.14.7 - 2026-10-30

#### Changed

- Automotive: the research boards show Karolina's originals again (persona, multi-market survey and interview synthesis, both themes). She approved the figures in writing and confirmed that her screenshots hold no confidential data, so nothing on them is blurred or painted over any more. The confidentiality note no longer says that some figures are hidden.
- Smart Ticket: the legacy My Profile screen shows its sample email address again, as Karolina approved.
- Search data: the Person block no longer lists the Google UX Design certificate, which no page mentions.

### 5.14.6 - 2026-10-30

#### Fixed

- Smart Ticket: the user flow under "From trip search to an offline inspection" keeps the top of its legend and its card border when the pointer is over it. The slight zoom on hover hides about 1% of each edge, and the diagram had no space there. Both versions now have 48 px of transparent space on every side in the file (2096 x 1350, was 2000 x 1254); the drawing itself is not scaled.
- Project Planning: the Brand primary and Semantic status token cards keep their top edge, corners and sides on hover (32 px more transparent space on every side, both themes).
- Smart Ticket: the lock screen keeps its home indicator on hover (12 px larger on every side, its own background continued, the same rounded corners).

#### Changed

- A new test (`src/app/zoom-margins.test.ts`) reads the zoom from the components and checks every case image and Work thumbnail: content stays out of the band the zoom hides, and out of twice that band on frameless images and thumbnails. Three light phone screens whose bottom sheet runs to the screen edge are listed exceptions.
- Docs: CLAUDE.md, the README and the architecture doc say that case images need room at their edges.

### 5.14.5 - 2026-10-30

#### Changed

- Link previews: a shared link to the site shows Karolina's new Portfolio Cover from Figma (`og-cover.png`, 1200 x 630 PNG, 134 KB) instead of the old image: her name, role, focus areas, the years of selected work (2018 - 2026) and her experience. LinkedIn, Facebook, Messenger, Slack and X show the light cover to everyone, because a link preview cannot follow the viewer's light or dark theme. The image has a new file name (images are cached for a week), both alt texts describe it, and the old `og-image.png` is gone.
- Figma: in the 1.91:1 cover the tagline now breaks after "and" instead of inside "token-driven".
- Tests: a new check keeps the link-preview tags and the image together (one address for Open Graph and X, a 1200 x 630 PNG under 1 MB, alt texts, nothing that keeps search engines or link-preview services from fetching it).
- Docs: the design doc says where the cover lives in Figma and how to change it; CLAUDE.md, the architecture doc, CONTRIBUTING.md and the docs-seo-reviewer agent name the new file. After the release, refresh the LinkedIn and Facebook previews (Post Inspector, Sharing Debugger), starting with the home page.

### 5.14.4 - 2026-10-30

#### Changed

- Work hero: two buttons only, Explore Case Studies and View CV, in one row from 480px wide; phones stack them as before. The Inspect Figma Workspace, View Code on GitHub and View Components in Storybook buttons left the hero: the same three links are in the Behind the Design banner lower on the page, and in the hero they pulled attention from the two main actions. The banner and its links do not change.
- Statistics: `figma-click`, `github-click` and `storybook-click` no longer come with `place: "hero"`, so that data stops from this version. The banner links still send `place: "banner"`, and `hero` stays for `cv-open`. No new data, so the privacy policy and the consent box do not change.
- Tests: the Work page tests check that the hero has exactly these two links and that Figma, GitHub and Storybook are linked only from the banner; the CV e2e spec checks the buttons in one row at 480 and 1280px and stacked at 390px. The scroll-reveal spec no longer needs its exception for the taller two-row hero; the WebKit exception for the About page stays.
- Docs: CLAUDE.md, the architecture doc and the tracking plan say the Work page links Storybook from the Behind the Design banner only.

### 5.14.3 - 2026-10-30

#### Changed

- The CV's recruitment consent is in English only, the language of the CV. One clause covers employers and recruitment agencies in Poland or abroad: the current recruitment, future recruitment by the same employer or agency for 12 months, and withdrawal by email. The GDPR applies across the EU, and Polish law asks for consent only for future recruitment, which the clause covers; a Polish paragraph in an English CV, a language picker or a second PDF would add length or a click without a legal gain. The PDF is tagged in English only and was made again (still 2 pages).
- The accessibility statement no longer mentions a Polish consent in the CV's PDF.

### 5.14.2 - 2026-10-30

#### Fixed

- Data Governance: the continued handoff cards (05, 06) now give their numbers to screen readers too. Before, screen readers counted them as 1 and 2 (WCAG 1.3.1). The list carries `start`, and only a list that does not start at 01 shows its numbers to assistive tech.
- The previous and next case links now name each case by its page title, so a case has one name in its links and on its page. The link to Data Governance used a shorter name. The names come from the cases themselves (`CASE_TITLES`), so they can no longer drift.
- In Dark mode, pointing at a case study preloads its Dark screenshots, not the Light ones (about 2 MB per case that Dark visitors never saw).
- Statistics switched off in one tab, or cleared site data, now stop at once in the other open tabs. Before, those tabs kept sending events and pageviews. A yes given in one tab now starts the statistics in the others.
- The email links on the privacy policy and the accessibility statement are now counted as `email-click`, with the new places `privacy` and `accessibility`. The policy already lists email links, so earlier yeses are not asked again (`STORED_CHOICE` unchanged).
- The CV PDF's portfolio link now uses `?utm_medium=cv-pdf` instead of `?ref=cv`. A click on it no longer replaces the company tag of a visitor who came from `/cv?ref=<company>`. The PDF was made again.
- The CV's English consent now matches the Polish one ("after they receive it", "a role I agree to").
- The case pages' sitemap dates are now 2026-10-30.
- Copy now says only what the cases show:
  - Automotive: the Work card, the Key Outcome and the reflections heading are plainer. The confidentiality note now says some research figures are hidden. The 1:1 interviews are now said to be with Polish dealers only.
  - Data Governance: the Key Outcome now claims AA contrast, not full compliance, and no longer says "days to minutes". Two other lines no longer state unmeasured results as fact.
  - Smart Ticket: the 2022 - 23 role is UX/UI Designer.
  - About: the GlobalLogic milestone no longer uses buzzwords.

- Smart Ticket: the 2022 profile screen no longer shows an email address on a real domain (painted out).

#### Changed

- `BannerLink` is now a shared component with a story. The Behind the Design banner and the case Figma file links both use it, instead of two copies of the same styles.
- New shared `EmailLink`: the email address as a link that is counted.
- A test now clicks every email, download and external link on every page and expects one statistics event for each.
- The release steps (CONTRIBUTING.md and the release skill) now set each changed page's sitemap date to the release date and commit `public/sitemap.xml` with the release.
- Docs:
  - README: the test count is now 860+.
  - Architecture doc: the preload size is now about 6 MB per theme, the consent section covers choices made in other tabs, and the new shared links are listed.
  - Tracking plan: new email `place` values, and what the PDF's links send.
  - Third-party notices: copy, mail, maximize-2 and sun added to the Feather list.

### 5.14.1 - 2026-10-30

#### Changed

- In the code, the Data Governance case is named after its page instead of "theming": `content/data-governance.content.ts`, `DATA_GOVERNANCE_CASE`, `DataGovernanceCaseStudy`, `CaseDataGovernanceView/` and `VIEW.caseDataGovernance`. The view id stays `case-theming`, so old `/#case-theming` links and the `case` value in the statistics do not change (a comment in `routes.constants.ts` and the tracking plan say so); the Work card id stays `theming-system`.
- File names follow one rule: content files without JSX end in `.ts` (`smart-ticket.content.ts`, `data-governance.content.ts`), the test helper is `src/test/match-media.ts`, and other modules in a component folder take the component's name (`Dialog.constants.ts`, `Dialog.utils.ts`), as CLAUDE.md and `docs/architecture.md` now say. `SmartTicketBlocks` moved to `CaseSmartTicketView.types.ts`.
- Removed the unused outcomes section from the shared case layout (`outcomes`, `outcomesTitle`, `outcomesIntro`); `DetailList` stays for the reflections, lessons and takeaways. The case order test keys the cases by `VIEW` constants.
- No visible change: every prerendered page is the same apart from the script bundle's file name, and the CSS, `llms.txt` and the CV PDF are byte for byte the same.

### 5.14.0 - 2026-10-30

#### Added

- A CV page at /cv, built from Karolina's Long CV in Figma with the site's design tokens. It shows Light or Dark on screen and is always light on paper. It has two columns from md and in print. Every section heading has a link to copy (/cv#experience). Opening one of these links leaves as much space under the header as on other pages. The breadcrumb reads Home > CV. The text is the Long CV as she wrote it, with the broken spacing of the Figma export fixed. There is no phone number or street address.
- A recruitment consent at the end of the CV, in English and in Polish (the Polish paragraph is marked as Polish). It covers:
  - the current recruitment, and future recruitment for 12 months;
  - an agency may send the CV only for a role she agreed to;
  - how to withdraw by email.
- The CV as a PDF, `public/karolina-kita-cv.pdf`, made from the page by `yarn cv-pdf` (`scripts/cv-pdf.ts`).
  - It is A4, 2 pages and always light. The footer has page numbers and takes its type style and colour from the design tokens. The page break is where Figma has it.
  - It has tagged headings, lists and links, bookmarks for its sections, clickable links, and the Polish consent tagged as Polish.
  - Its portfolio link carries `?ref=cv`.
  - The CV page has a Download PDF (2 pages) button. In an app's built-in browser (LinkedIn, Messenger), a short hint says the PDF opens best in the phone's browser. Screen readers hear this hint with the button.
- Ways to the CV:
  - Work hero: View CV next to Explore Case Studies, at the same height. From 480px wide the hero has two rows of buttons: the case studies and the CV, then Figma, GitHub and Storybook. Phones stack them as before.
  - About hero: View CV next to Explore Selected Work.
  - Contact page: a CV cell with View CV and Download PDF links. They sit as close to their label as the LinkedIn link does.
  - "(2 pages)" never breaks across two lines. One helper (`cvPdfLabel`) builds this label for the CV page and Contact.
- Statistics:
  - New `cv-open` (`place`: `hero`, `about`, `contact`) and `cv-download` (`place`: `cv`, `contact`) events.
  - `email-click` and `linkedin-click` get `place: "cv"` for the CV's own links.
  - "download" joins the verbs in the tracking plan.
  - The privacy policy's "What I count" names links to the CV and to its PDF (updated 30 October 2026).
  - Not a new kind of data: the consent box already covers what visitors click, so `STORED_CHOICE` stays `on-3`.
- New tests:
  - `src/app/seo/cv-pdf.test.tsx` fails when the CV's text, markup or classes change without a new PDF. It compares them with two hashes in `scripts/cv-pdf.lock.json`.
    - It also checks the PDF's A4 size, page count, tags, title, languages and links, its `_headers` rule, and that git publishes it.
    - A change in `tokens.css` or `print.css` still needs `yarn cv-pdf` by hand.
  - `e2e/cv.e2e.ts` checks in Chromium, Firefox and WebKit:
    - the page in both themes and light in print;
    - the download, and the in-app hint and its link to the button;
    - /resume, and the page at 320px;
    - section links on the CV;
    - the Work hero's first row;
    - the Contact page's CV cell.
  - `relative-units.test.ts`: width media queries in the stylesheets must use a breakpoint token (the CV's `sheet:` variant is md).
- Icons: FileText and Download (Lucide).

#### Changed

- /resume and /#resume open the CV again, not About. /cv is now the CV page; the 4.0.0 redirect from /cv to About is gone.
- Search and AI assistants: /cv is a profile page with its own description. It is in the sitemap and in `llms.txt`, together with the PDF's address.
- `public/_headers`: the PDF keeps its address and is checked again on every visit. A canonical link points search engines at /cv. `.gitignore` publishes this one PDF and still ignores every other PDF. `.gitattributes` marks PDFs as binary.
- The accessibility statement names the CV under what you can do: read it as a page or download the PDF. Its known limits add that the PDF is A4 and always light, and does not follow text size or contrast settings; the CV page does (updated 30 October 2026).
- `Lang` can mark a whole paragraph (`as="p"`). Chromium tags a paragraph's language in a PDF, but not a span's. New "Other language, paragraph" story.
- `yarn a11y` also tabs through /cv with the consent box showing.
- Sitemap dates for the pages that changed: Work, About, Contact, CV, Privacy and Accessibility.
- Docs:
  - CLAUDE.md, README (now four case studies), architecture, the tracking plan, and third-party notices (new icons, fonts embedded in the PDF).
  - The copy reviewer now checks that facts agree across Work, About, Contact and the CV.

#### Fixed

- `e2e/scroll-reveal.e2e.ts` failed after the heroes grew. Two checks now leave out exactly two cases, and nothing else:
  - axe's colour-contrast report on a fading card whose text is not on screen. At 1280 x 800, Work now opens with its first case card at the fold.
  - WebKit's `translate: 0px` at the one scroll position where a card's bottom meets the scroll padding (the end of WebKit's view timeline).
  - Faint text on screen, and a `fill: both` regression, still fail.

### 5.13.4 - 2026-10-30

#### Fixed

- With Dark saved (or a dark system setting), the theme switch shows and announces Dark from the first moment the page appears, not Light until the site has loaded: the inline script in `index.html` presses the right button before the first paint, and the switch's look follows `aria-pressed` in CSS.
- Pressing Tab through the stuck header while reading further down no longer scrolls the page (Chrome and Edge jumped about 400px up per Tab, Safari a little), also while the statistics consent box shows. The header's own controls are exempt from the scroll padding; page content focused behind the header still scrolls clear of it (WCAG 2.4.11).

#### Changed

- On phones there is more space between the logo and theme switch row and the menu row of the header (`gap-y-xs`, 8px instead of 4px).
- In Messenger and other in-app browsers the theme now changes at once, without the cross-fade, which most likely hid the top of the header there for a moment.
- Comments and docs that named the wrong file or behaviour are fixed (theme, pill, image viewer, in-app browsers); `docs/architecture.md` and CLAUDE.md describe the switch's first paint, the header's scroll margin and the case screenshot helper. `e2e/header-layout.e2e.ts` covers the phone header rows and focus inside the stuck header.

### 5.13.3 - 2026-10-30

#### Changed

- The two Figma file links on a case study are counted apart: `figma-click` sends `place: "top"` for the link under the details panel and `place: "end"` for the design files banner, each with `case` (both sent `place: "case"` in 5.7.0 - 5.13.2, never live). Not a new kind of data: the privacy policy already lists Figma links.
- Clicks that do nothing and text copies on the new case-study blocks get a label: the before / after comparisons and the numbered cards count as cards (named by their title), a stat card is named by its figure (`data-card-title`), and a screenshot by its caption. A click on the empty space around a captioned screenshot counts as a click on the image.
- The tracking plan test also checks each event's Properties column in `docs/analytics.md` against `EventData` (`EVENT_PROPERTIES`); the add-tracking skill says so.

#### Fixed

- Umami's own error reports can never send stack traces: the script tag sets `data-errors="false"`, and `beforeSend` cancels every request of type `error`. `js-error` with its short message stays the only error data, as the privacy policy says.
- `text-copy` never sends the copied text as its label: when the selection holds part of a heading, caption or stat figure, that label is skipped for the card's name, or left out. Copying a heading used to send the heading itself.
- `docs/analytics.md` says that the speed report covers only the first 10 s of each view, so INP and CLS miss later interactions, and lists `testimonials` among the `place` values and image captions under `label`.

### 5.13.2 - 2026-10-30

#### Fixed

- Smart Ticket: the user flow diagram no longer sits inside a second frame; its legend sits on the page as in Figma (Light and Dark).
- Smart Ticket: "60 s" no longer breaks between the number and the unit on phones.
- Code comments that said the wrong thing are fixed (the Smart Ticket and Project Planning content headers, the Smart Ticket row spacing, the `MediaSection` type, the persona goal tint). Project Planning cites only the Figma node id.

#### Changed

- One naming convention for case screenshots. A card's id is its image's base name in all four case studies (for example `multi-market-survey`, `admin-operations-dashboard`), so the statistics' `image` value names the file it shows; many old ids, such as `survey` or `contrast`, belonged to screenshots that have since been replaced. Smart Ticket's Security & Biometrics screen no longer shares an id with its comparison.
- Six Smart Ticket screenshots have names that say what they show: `legacy-sign-up-email.webp`, `legacy-sign-up-phone-number.webp`, `semantic-inversion-light.webp` / `-dark.webp`, `create-account-details-light.webp` / `-dark.webp` (never published under the old names).
- The case content builds its screenshot cards with one helper, `caseShots(folder)`: `shot()` for a Light and Dark pair, `singleShot()` for a screen in one version; a test checks that each card's id, Light file and Dark file name the same screen. README shows it.
- The case content names the previous and next cases with `VIEW` constants. `BentoVisual` has its own component folder, and content types no longer share a component's name (`Feature`, `ImpactSection`, `ComparisonSideContent`, `BentoVisualContent`).

#### Removed

- `KeyOutcomes` and the `highlights` field of a case section: no case study has used them since 5.11.0.

### 5.13.1 - 2026-10-30

#### Changed

- 5.7.0 - 5.13.0 were built outside this repo and are committed here together. Before that, every image and text was checked for names and figures that may not be published:
  - The Project Planning product name is painted out of its Work thumbnail and its calendar screenshot (Light and Dark), removed from this changelog and a code comment, and added to the hidden-name test.
  - The Automotive persona, survey and interview boards hide the respondent counts, the salary, the per-market response counts, shares and bars, and the dealer's sales quote again, as decided on 2026-10-26. The case text keeps its totals and rounded figures (545 responses, 7 of 8 markets, over 40% from one market).
  - Project Planning shows no Figma link for now: the linked file still shows the product name.
- The Work thumbnails are `thumbnail-light.webp` / `thumbnail-dark.webp` in every case folder (one name for all four; they were never published under another).
- New case images carry no Content Credentials metadata (a 5.8 KB chunk per file, removed losslessly).

#### Fixed

- The numbered bento cards that close the Data Governance case stay still, like every closing section (`Card` takes `reveal={false}`; new "Still" story).
- Status badges (success, warning, error) keep their tinted fill and border but write the label in the body text colour, as Figma's bento badge does: the green label reached only 3.9:1 at Label Small (WCAG 1.4.3 needs 4.5:1).
- The property names in the Data Governance code card use Figma's orange (`status-warning-text`); the link colour reached only 3.8:1 on the Dark code fill.
- The Data Governance code card carries its name on a figure: ARIA does not allow `aria-label` on `<pre>` (WCAG 4.1.2).
- Smart Ticket prices read "PLN 4.40" in the text and alt texts, so a screen reader no longer reads the Polish "zł" in an English voice (WCAG 3.1.2).
- The tests follow the new content: four Work cards, the new Automotive headings, and link names in jsdom. The scroll-reveal e2e covers Smart Ticket too, and counts cards side by side as entering together.

### 5.13.0 - 2026-10-29

#### Added

- `BentoCards`: numbered cards (01, 02 ...) on the Card surface with a status badge, a title, a short body and an optional small visual (tags, checks, label samples, colour swatches, a code snippet or two phases on a line). Wide cards span two columns of a three-column grid; every colour is a token, so Light and Dark mode work without extra rules. Sample brand colours inside a visual are content and stay the same in both modes.
- Badge `warning` tone for planned, not-yet-shipped items ("Phase 2 · Roadmap"), with a story.
- `--font-mono` (system monospace, no web font) for code snippets.

#### Changed

- Data Governance: MVP Delivery (01 - 04) and Developer Handoff (05 - 06) now use `BentoCards` instead of text lists, with the facts aligned in 5.12.0: label samples for the automatic white / near-black labels, swatches for hover (+30% black), pressed (+30% white) and disabled (40% opacity), and the selection rules as stylesheet variables.

### 5.12.0 - 2026-10-29

#### Changed

- Data Governance case study: 8 new screenshots, each in a Light and a Dark version (`cases/data-governance/<name>-light.webp` / `-dark.webp`, 2000 px wide); the old ones are no longer shipped.
- Data Governance copy checked against the new screens: the state rules now match them (hover +30% black, pressed +30% white, disabled 40% opacity, labels white or near-black; selected rows and sidebar items at full colour, 35% tint on hover, +8% black when pressed; navigation tabs +35% white or +8% black). The theme editor is described as a full-page editor with sections, not a modal; Custom CSS sits last, marked Advanced, with a re-test checkbox. The colour-vision preview stays labelled Phase 2, and the confidentiality note says the screens are rebuilt with sample data and that "Tallyst", "Harbor Bank" and "Northwind Health" are fictional.
- MVP Delivery: the status moved from the titles into badges ("Shipped · MVP", "Phase 2 · Roadmap"). Key Takeaways use the numbered cards (`NumberedCards`), as in Automotive.

### 5.11.1 - 2026-10-29

#### Changed

- Automotive case study: the copy now credits each step to the right person. The Team Leader (Design Lead) built the coded prototype, the UX Researcher ran the sessions with UK dealers, and Karolina audited the prototype and turned the research and audit findings into refined designs in Figma (Overview, Auditing the Coded Prototype, Testing & Final Design, Reflections).

### 5.11.0 - 2026-10-29

#### Changed

- Automotive case study rewritten as "Automotive B2B Ecosystem: From Dealer Research Across Europe to a Validated Redesign": new Overview & Problem, five sections (Research Across 7 European Markets; Personas, Journeys & Usability Audit; Benchmarking, Flows & Specifications; Auditing the Coded Prototype; Testing & Final Design) with 17 screenshots, each in a Light and a Dark version (`cases/automotive/<name>-light.webp` / `-dark.webp`, 2000 px wide), and a new confidentiality note. The Work card and the page description now say 7 European markets; the previous / next labels on Smart Ticket and Project Planning use the new title.
- The old Automotive screenshots and the replaced Work thumbnails (`thumbnail-v2.webp`, `smart-ticket/thumbnail.webp`) are no longer shipped (moved out of `public/`), so no unused image stays reachable by URL.

#### Added

- `NumberedCards`: numbered takeaway cards (01, 02, 03) in the info colours, an opt-in closing layout for case studies (`reflections.layout: "numbered"`), used by Automotive's Reflections.
- `CaseSummary`: summary columns may leave out their title; untitled columns read as plain paragraphs in one column.

### 5.10.0 - 2026-10-29

#### Changed

- Work page: new case thumbnails for all four case studies, each in a Light and a Dark version that switches with the theme (`thumbnail-light.webp` / `thumbnail-dark.webp`, 1440x900). The thumbnail frame is now 16:10 (new `aspect-case`) and the image fills it edge to edge: no border, no inner padding, no letterboxing, corners rounded to match the card (`rounded-md`). Hover keeps the slight zoom; the border colour change is gone with the border.

### 5.9.0 - 2026-10-28

#### Added

- Case studies with a Figma file (Smart Ticket, Project Planning) link it at the top too: "Open the Figma file" with the Figma icon sits right under the details panel, so the design files are one click from the start. The Design files banner at the end stays. Both links share one component (`DesignFileLink`) and count as the same `figma-click` (`place: "case"`). Cases without a file (Automotive, Data Governance) show no link.

### 5.8.5 - 2026-10-28

#### Changed

- Before / after comparison cards: from tablet width the two columns share their rows (CSS subgrid), so the screens of "Legacy concept" and "Modern rebuild" start on the same line however long the text and chips above them are. Every preview keeps the same width, height, frame and spacing.
- Comparison card titles ("Legacy concept (2022)", "Modern rebuild (2026)", "2022 brief", "2026 decision") and the reasoning titles below the cards use the body text colour and bold (700) instead of grey or link blue. The site and Storybook now load Inter 700.

### 5.8.4 - 2026-10-28

#### Changed

- Smart Ticket, "Visual foundation" comparison: the 2026 column shows the Create account screen in Light and Dark mode side by side, as in the Figma frame, so it fills the column like the two 2022 screens without making the card taller. This pair shows both token modes, so it does not switch with the site's theme.

### 5.8.3 - 2026-10-28

#### Changed

- Project Planning: the "46 screens" outcome card is replaced by "Light & Dark" (one token collection with two modes; the same screens switch mode through token values). The outcome cards now hold no screen counts, only facts the Figma file's variables and contrast checks show.

### 5.8.2 - 2026-10-28

#### Changed

- Project Planning: the outcome cards keep only facts from the Figma file (46 screens with status pills, AA+); the extra "1:1 PrimeNG" card that stood in for the removed sprint-velocity claim is gone, and the token mapping stays in the brand foundation section. Two cards now share a row from 768px (`CaseImpact` picks two or three columns by count).
- Project Planning: the note under the header ("About these screens") says the screens are a curated, sanitised and refactored subset of a larger production system, adapted for the portfolio, with company names, logos and financial data generalised or removed under NDA and realistic sample data in European formats. The Key Outcome leads with the token system; the outcomes section is "Design outcomes - What the design system delivers".

### 5.8.1 - 2026-10-27

#### Changed

- Smart Ticket and Project Planning copy checked against the Figma files (screens, notes, status pills and variables), and every claim the canvas does not show is rewritten or removed:
  - Project Planning: the unproven "~35% faster sprint velocity" and "4 → 1 spreadsheets" stats are replaced by what the file shows (46 desktop screens with status pills - 29 production ready, 17 proposals; a 1:1 PrimeNG Aura token mapping; AA+). The goals and milestones timeline is labelled a proposal, as in Figma. The calendar no longer claims to show meeting cost (the Meetings page does), and the budget-bar, drawer, KPI and approval copy follows the Figma notes.
  - Smart Ticket: 56 mobile screens and states (not 53 or 76), the offline pass describes the signed token as an engineering requirement, the 2022 "black lines" claim and the "sign-out in red" shift are replaced by what the 2022 screens show, status colours use the real token values, checkout names the Review & Pay sheet and the Smart Wallet, and "0 passenger data fields" becomes "No passenger browsing" (one masked record by exact reference, 15 minutes, logged).
  - The Project Planning Work card summary follows the same facts.

### 5.8.0 - 2026-10-27

#### Added

- A new case study at `/work/smart-ticket`: "Smart Ticket: Mobile Ticketing & Transit Operations", first on the Work page and first in the case navigation (Smart Ticket → Automotive → Project Planning → Data Governance). It follows the Figma frame "Case Study / Smart Ticket (2026)": details table and info note, executive summary, three rider personas as text cards, the user flow, design system rows, two 2022 vs 2026 comparisons with measured results, five passenger app features beside their phone screens, the operations console with eight captioned screens, six outcome cards with a note that they are design decisions, lessons learned, and a design files banner linking the Smart Ticket Figma file. It has a page title, a search description, a sitemap entry and a Work card with its own thumbnail.
- 43 screenshots and a thumbnail in `cases/smart-ticket/`: every 2026 screen in Light and Dark (they switch with the site's theme, in the page and the image viewer); the five 2022 screens and the Lock Screen exist in one version and show as they are in both themes.
- `CaseSmartTicketView` and its building blocks in the case-studies slice: `PersonaCard`, `ComparisonBlock`, `ComparisonSide`, `ScreenGrid`. `ShowcaseRow` takes phone screens (`device: "phone"`: a wide text column beside a 376px phone card) and extra paragraphs; `CaseImpact` takes a note under the cards.
- `Badge` takes a `tone` (`neutral`, `error`, `success`) for measured results, with stories.

### 5.7.0 - 2026-10-27

#### Added

- The Project Planning case follows its new Figma layout: a details table and an info note, an executive summary with a lead line and "The problem" / "My part" columns, four feature sections (brand foundation and tokens, calendar, goals and milestones timeline, dashboards and budget) with a text column beside the screenshots, and a "What changed" section with three stat cards. Twelve new screenshots (six screens, each in Light and Dark), WebP at quality 90; the eleven old screenshots and the old thumbnail are removed.
- Light and Dark screenshots: a screenshot card can name a `darkAsset`, shown while the site is in Dark mode, in the card, the image viewer and the background preload. A missing or broken dark file falls back to the light one. `useDocumentTheme` reads the theme from `<html>`, so images switch in the same frame as the colours. The Work page thumbnail takes an optional `darkAsset` too.
- A design files banner near the end of a case study (`designFile` in the case content): an info banner with a link to the case's Figma file, opened in a new tab and counted as `figma-click` with `place: "case"`. The Project Planning case links its Figma file.
- `Section` takes an optional `eyebrow` above its heading, with a story.

#### Changed

- Every case study shares the new layout: screenshot rows drop their card box for a 440px text column beside a framed screenshot (12px radius, medium shadow), alternating sides from 1024px and stacked text first below it; the executive summary uses titled columns in all three cases; the details table uses Title Medium labels and Body Large values with 24px padding; confidentiality notes use the info tone.
- The Project Planning thumbnail on the Work page is the new dashboard composition (`thumbnail-v2.webp`).

### 5.6.1 - 2026-10-26

#### Changed

- The footer's Privacy and Accessibility links are separated by a vertical bar, like the copyright line above them: "Privacy | Accessibility". They stay on one line down to 320px; if a large text size wraps them, the taller lines keep their 24px target areas apart (WCAG 2.5.8).

### 5.6.0 - 2026-10-26

#### Added

- An accessibility statement at `/accessibility`, linked from the footer next to Privacy: what the site supports (keyboard, screen readers, zoom, text size, dark mode, reduced motion, more contrast, Windows contrast themes), its known limits (text inside screenshots, other websites), how it is checked and how to report a problem. Like the privacy policy it has a page title, a search description, a sitemap date, an `llms.txt` line and a breadcrumb; the copy rules test checks its text, and `yarn a11y` checks it with every other page (38 scans, 0 violations). A copy review made two claims more exact (Storybook's examples are checked without colour contrast; one real browser, with reduced motion and more contrast tested separately).
- `ProseSection` in `shared/ui`, with a story: a text page's section of paragraphs, points and an optional component. The privacy policy and the accessibility statement both use it; it replaces the privacy slice's own section view.

#### Changed

- The footer's Privacy and Accessibility links sit side by side.
- The `a11y-reviewer` agent names the specs that test reduced motion (`header-motion`, `scroll-reveal`) and more contrast (`contrast`).

### 5.5.0 - 2026-10-26

#### Added

- Stronger colours when a visitor's system asks for more contrast (macOS and iOS "Increase contrast"; `prefers-contrast: more`), in both themes. Secondary text, links, borders, focus rings and callout colours move to darker or lighter colours from the same palette, so reading text reaches 7:1 and borders 3:1; nothing changes for everyone else. The Figma colour collection has two new modes, "Light more contrast" and "Dark more contrast" (copies of Light and Dark with 20 tokens pointing elsewhere; all 106 semantic colours checked against the code), and the token export carries them. In light, the warning, error and success texts become near-black, because no warm palette colour reaches 7:1 on its tinted background.
- `src/styles/contrast.test.ts` checks those targets (proved on the normal palette, where it fails), `tokens.test.ts` keeps the new modes in step with Figma, and `e2e/contrast.e2e.ts` checks in Chromium, Firefox and WebKit that the stronger colours apply with the setting and only then.

### 5.4.0 - 2026-10-26

#### Added

- The site follows the browser's text size: spacing, type, layout widths, breakpoints and icons are in rem (Figma's px / 16), so a visitor who sets a larger default size gets a page that grows as with zoom. At the default size nothing moved: all boxes on 7 pages at 3 widths in both themes are the same to the pixel as before. At 200% text no page scrolls sideways and no text is cut off; long words break only where they do not fit (`overflow-wrap`), section headings may shrink beside their copy-link button, and button labels may wrap.
- `yarn a11y` checks every page at a 200% browser text size (no sideways scrolling, no text cut off) and in a Windows contrast theme (forced colours: a focus outline on every Tab stop, plus a screenshot per page). Both pass.
- `src/styles/relative-units.test.ts` fails when a stylesheet or the theme gets a px length where rem belongs (proved with a px probe file).

### 5.3.4 - 2026-10-26

#### Added

- LICENSE has a Contributions section: everyone who contributes to the site, such as a co-author named in a commit, gives Karolina Kita a non-exclusive, perpetual licence to use, change, publish and sublicense the contribution under any terms she chooses, also for contributions made before it was added; contributors keep their copyright. CONTRIBUTING.md says so under Every commit.

## Release v5.3.3 - 2026-10-26

- Visitor statistics, which run only if you allow them, now also note the height of your browser window and which pages were read after opening a tagged link, such as one in a job application; the privacy page says so and explains more exactly how visits are counted.
- Behind the scenes: updated libraries, clearer licence notes for the icons and fonts, and better accessibility checks.

Versions: 5.2.5 - 5.3.3.

### 5.3.3 - 2026-10-26

#### Fixed

- The privacy policy is more exact about what the statistics already did: Umami also uses the IP address, with the browser's details, to group page views into one session without a cookie, not only to work out the location; addresses keep `?ref=` and the `utm_` campaign tags, not only lose the click IDs; and a tagged link counts for the pages read on that visit or a later one in the same session. "What is recorded with it" is now "What is recorded with each visit", and its list reads more easily. Nothing new is collected, so nobody is asked again. The tracking plan says visits are linked only within Umami's own session.

### 5.3.2 - 2026-10-26

#### Added

- Claude Code helpers for the requests that came up most often (215 requests over 14 sessions). Skills: `add-tracking` (statistics events and session data), `update-dependencies`, `sync-design-system` (Figma, tokens, components and the claude.ai design system) and `record-rule` ("remember ..."). Agents that only report: `ui-reviewer` (design tokens, components and UX patterns, with screenshots on phone and desktop in both themes), `docs-seo-reviewer`, `confidentiality-reviewer` (never writes a hidden name) and `pattern-sweeper` (the same root cause elsewhere, and a guard). CONTRIBUTING.md has a table of what to use when; `docs/claude-code.md`, CLAUDE.md and the README list them. Personal `local-*` skills stay out of the repo (`.gitignore`).
- `yarn a11y`'s summary names the axe version that ran and lists the results axe could not decide ("Needs manual review by rule"). The audit ran axe 4.13 from `@axe-core/playwright` while Storybook ran 4.14, so the 2.5.3 rule (`label-content-name-mismatch`) was off in the page audit until the 5.2.7 update; now 34 scans, 0 violations, and 8 undecided contrast results, all decorative avatar initials.

#### Changed

- `a11y-reviewer` follows current practice: it starts from the changed files, also runs the motion e2e spec, rules on every result axe could not decide, walks a checklist of what tools miss on this site (text spacing, hover content, dragging, consistent help, status messages, and more), grades findings by severity with their evidence, and lists the limits of the run and the screen reader checks a person still has to do. Its description says to use it proactively.
- The `release` skill can be started by Claude when the user asks for a release, not only by typing `/release`. It says what to do when the deploy fails and lists the caches to refresh. `ship-change` points to the e2e run and the reviewers after UI changes.

### 5.3.1 - 2026-10-26

#### Fixed

- LICENSE and THIRD-PARTY-NOTICES.md name the icons' current file (`src/shared/ui/icons/icons.tsx`). LICENSE lists the two fonts (SIL Open Font License 1.1) and says more exactly what Anthropic's terms do: they assign to the user whatever rights Anthropic has in Claude's output. THIRD-PARTY-NOTICES.md gives the fonts' copyright lines and a link to the licence text. `package.json` says `SEE LICENSE IN LICENSE` instead of `UNLICENSED`, because the licence grants some uses (viewing, linking, forking on GitHub).
- README: Netlify builds only `main` (with Storybook) and never `develop`; the docs list names the tracking plan; the notices cover fonts as well as icons; cache refreshing points to CONTRIBUTING.md.

#### Added

- CONTRIBUTING.md, release step 5: which services cache the site's previews and search results (LinkedIn, Facebook and Messenger, Google Search Console, Google's structured data test, Bing), the link to each tool and what to enter, and a fresh `?ref=` tag for apps without a refresh button.

### 5.3.0 - 2026-10-26

#### Added

- Two more session properties in the visitor statistics: `viewportHeight`, the browser window's height in ranges (under 500px ... 1100px or taller), to see how much of a page fits on the first screen; and `ref`, the tag of a tagged link (`?ref=`, else `utm_source`) when the page was opened from one, so Umami's Sessions page lists the visits each application or channel brought, and their later visits in the same session stay under it. `linkRef` moved to `payload.utils.ts`, and the three range helpers share one function.
- The tracking plan names what stays out on purpose: the browser's exact version, the time zone, the list of languages, fonts or supported features (fingerprinting signals). It says a Segment with Session data filters narrows any report to a session property.

#### Changed

- The privacy policy (dated 26 October 2026) says that the statistics note the window's height as well as its width, the version of the site you saw, and which pages were read after a tagged link. All three belong to kinds of data already listed (window size, tagged links, what Umami records with each visit), so visitors who allowed statistics are not asked again and the consent box stays as it is.

### 5.2.7 - 2026-10-26

#### Changed

- Dependencies updated: React and React DOM 19.3.1 (also in `resolutions`), Vite 8.3.5, Vitest 5.0.5, Storybook 10.6.4 (all four packages), ESLint 10.13.0, typescript-eslint 8.72.1, @eslint-react/eslint-plugin 5.28.8, @vitest/eslint-plugin 1.6.28, Playwright 1.64.1, @axe-core/playwright 4.14.0, jsdom 30.1.3, Prettier 3.9.10 and @testing-library/user-event 14.6.8. TypeScript stays on 6.0: typescript-eslint 8.72 supports TypeScript below 6.1 only, so 7.0 waits for it. Checked with `yarn verify`, a Storybook build and the full e2e run in three browsers (347 passed).

### 5.2.6 - 2026-10-26

#### Changed

- Netlify builds only `main`: pushes to `develop` and pull requests are never built or deployed. `netlify.toml` has one build command (tests, site, Storybook) and an `ignore` command that stops any build outside the production context. CONTRIBUTING.md lists the matching project settings (Branch deploys: only the production branch; Deploy Previews: none) and how to check a change locally instead. CLAUDE.md, the docs and two code comments no longer mention a `develop` branch deploy.

### 5.2.5 - 2026-10-26

#### Added

- Visitor statistics send the site's version (`version`, from `package.json`, as in the footer) with the session data, so Umami's Sessions page lists it among the properties with its values, beside the window width, theme and in-app browser. Every call already carried it as Umami's tag, which the dashboard offers as a filter and under Other → Tag, not among the properties. The version describes the site, not the visitor, and Umami already received it, so the privacy policy and the consent box stay as they are.

## Release v5.2.4 - 2026-10-26

- Everything in release v5.2.3 below is now on the site: an automated check had stopped that release before it went live, and this release fixes the check.

Versions: 5.2.4.

### 5.2.4 - 2026-10-26

#### Fixed

- Release v5.2.3 did not go live: Netlify's build stopped after all 580 tests had passed. The plain-text page test rendered every page with the real image preloader, whose idle timer fired after the test's browser environment was gone and threw "Image is not defined", and Vitest fails the whole run on such an error. The test now mocks the preloader, like the other tests that render whole pages. On this machine the test process ended before the timer fired, so `yarn verify` passed; a probe that removes `Image` and waits reproduces the failure. CLAUDE.md lists the trap under Pitfalls.

## Release v5.2.3 - 2026-10-26

- Each case study now has previous and next links at the top, beside the breadcrumb, so you can move between cases without scrolling to the end.
- The footer shows the site's version, linked to the release notes, so you can tell whether anything changed since your last visit.
- Google can now show the site's icon in search results.
- The site is easier to use with a keyboard or a screen reader, checked against WCAG 2.2: the statistics box no longer covers the link you move to and fits small or zoomed screens, and the theme switch and dark-theme buttons are clearer.
- Search engines and AI assistants read the pages more cleanly, and two image descriptions are more accurate.

Versions: 5.0.1 - 5.2.3.

### 5.2.3 - 2026-10-26

#### Changed

- The project planning case's section links no longer start with "me-", a trace of the product name hidden in 5.0.0. The address bar now shows `#planning-summary`, `#planning-foundations`, `#planning-calendar`, `#planning-cockpits`, `#planning-roadmap` (was `#me-planning`), `#planning-operations` and `#planning-outcomes` while you read. An exception to keeping section ids stable: the old ones were live for a few hours only, and the case's address changed in 5.0.0 the same day. A link with an old `#me-` part opens the case at the top. Screenshot ids in the statistics change with them.

### 5.2.2 - 2026-10-26

#### Fixed

- After a copy review of today's changes: the heuristic summary's alt text names the two most broken heuristics one at a time, with their counts, instead of joining them with two "and"s in a row. The theming card's alt says the Create New Theme panel sits between the two Edit Theme panels. Both use the American spelling of the copy around them.
- The top previous / next links' landmark is named after the links it holds: "Previous and next case studies", or "Previous case study" and "Next case study" on the last and first case, where it holds one.
- A range in the 5.0.1 entry has the short hyphen with spaces.

### 5.2.1 - 2026-10-26

#### Changed

- The Privacy page's search description says that visitor statistics run only if the visitor allows them, as the policy does, instead of "cookieless visitor statistics". Its sitemap date is today, because the description is also in its structured data.
- The docs follow today's changes: WCAG 2.2 AA is the minimum in CLAUDE.md, the README, `docs/architecture.md`, `docs/claude-code.md`, the Storybook welcome page and the a11y-reviewer agent (which now also reads the hidden-focus and consent box checks). CLAUDE.md has the rules for focus that nothing hides, names that start with the visible label, states beyond the yellow marker, and spaces between neighbouring elements. `docs/design.md` lists the new design rules (breadcrumb roots, previous and next at both ends, dark labels on gold, the theme icon, the footer version).
- The case studies and the About page keep "WCAG 2.1 AA" where they describe past projects: that is what those projects met.

### 5.2.0 - 2026-10-26

#### Added

- Previous and next case study links at the top of each case study, at the end of the breadcrumb row, so readers can move between cases without scrolling to the end. They say "← Previous" and "Next →"; screen readers hear the case name too ("Next case study: Enterprise White-Label Theme Generator"). On narrow phones they move to a row of their own, on the right. The first and the last case show one link: the breadcrumb's "Work" already leads back to the list. The full links with the case names still close each case study.
- `CaseNavLink` has a `place` variant (`top`, `end`), and `case-nav` events carry it, so the statistics show which links readers use (tracking plan updated).

### 5.1.1 - 2026-10-26

#### Fixed

The rest of the WCAG 2.2 A and AA review (four reviewers, file by file):

- Secondary buttons in the dark theme: on hover and while pressed, the label turns dark on the gold fill. The light label read 2.98:1 and 2.25:1 there, under the 4.5:1 of 1.4.3. Subtle buttons (Storybook only) use the dark label in every state.
- The theme switch fills the icon of the chosen theme. The yellow marker alone reads 1.54:1 on the white switch, under the 3:1 a state needs (1.4.11).
- The scrollbar of a zoomed image in the image viewer is darker in the light theme: 8.41:1 instead of 1.97:1 (1.4.11).
- The logo link's name starts with the wordmark it shows, "K.Kita - Karolina Kita, home page", so the voice command "click K Kita" finds it (2.5.3). The tooltips of the copy-link and copy-email buttons now match their names.
- After answering the statistics box with the keyboard, focus moves to the page content instead of dropping to the top of the page (2.4.3).
- On case studies the breadcrumb's "Work" opens the list of case studies and has no house icon. "Home" with the house icon stays the home page on the other pages (3.2.4: one name for one destination).
- Two alt texts now describe their images: the automotive heuristic summary table, and the theming card, whose middle panel is Create New Theme (1.1.1). When a full-size image does not load, the viewer still gives its description to screen readers.
- The copy-link icons next to section headings appear at once instead of fading in, so their focus ring does too.
- A press that starts inside the image viewer and ends over the backdrop (selecting the title, panning an image) no longer closes it.
- Icons are hidden from screen readers unless they get a name.

#### Changed

- `e2e/motion-a11y.e2e.ts` also fails when an element that is hidden until focus fades in with its focus ring (`e2e/helpers/focus-ring.utils.ts`). Checked against the live site, which still has the fade.

### 5.1.0 - 2026-10-26

#### Added

- The footer shows the site's version from `package.json` ("Version 5.1.0"), linked to the release notes (`CHANGELOG.md` on GitHub, newest release first), so a returning visitor can tell whether anything changed since their last visit. It ends the copyright line, two lines away from the Privacy link, because two small links on neighbouring lines would be closer than WCAG 2.5.8 allows. On phones it moves to the next line as a whole. The footer story and an App test check it against `package.json`.

#### Changed

- CLAUDE.md: the footer's version number does not count as a content change for a page's sitemap `<lastmod>`.

### 5.0.3 - 2026-10-26

#### Fixed

- Words ran together for anything that reads the pages without CSS (search engines, AI assistants, reader modes, plain-text copies): "Back to All WorkNext Case StudyEnterprise", "SWStewart WilsonUX Director", "Based in PolandProduct & UX/UI Designer", the hero and banner link labels, the privacy page's policy links and a heading with a "Roadmap" badge, 21 places in all. The HTML now has a space between them. The layout does not change: every changed element's box matches the live site at 390 and 1280 px.

#### Added

- `src/app/plain-text.test.tsx` renders every page and fails when words from two elements touch with no space between them (`src/test/plain-text.ts`). It found the 21 places before the fix.

### 5.0.2 - 2026-10-26

#### Fixed

- Google Search showed a plain globe instead of the site icon. The site linked only `favicon.svg`, which Google Search does not read (its list: BMP, GIF, ICO, PNG, JPEG, PPM and TIFF), and `/favicon.ico` answered with the 404 page. Every page now links, after the SVG, a 96 px PNG, an ICO with 16, 32 and 48 px images, and a 180 px icon for iOS home screens.

#### Added

- `yarn favicons` (`scripts/favicons.ts`, with sharp) makes the PNG and ICO icons from `public/favicon.svg`, so they always match it.
- `public/_headers` caches the icons for a day: their names never change, as Google asks, and a new icon still reaches visitors.
- `src/app/seo/favicons.test.ts` fails when `index.html` misses an icon link, a linked file is missing or has the wrong size, or an icon gets `X-Robots-Tag` or a robots.txt block. `scripts/prerender.ts` fails the build when a prerendered page loses an icon link. Both are checked with probes that must fail and must pass.
- CLAUDE.md, the README and `docs/architecture.md` describe the icons and the new command.

### 5.0.1 - 2026-10-26

#### Fixed

- Keyboard focus no longer ends up behind the statistics consent box (WCAG 2.2, 2.4.11 Focus Not Obscured). While the box shows, the page keeps the strip it covers clear: a focused link or button scrolls above it, the end of the page gets the same space so the last footer links can scroll clear, and Back to top moves up above it (`useConsentSpace`, `--kb-consent-h`).
- On short windows (landscape phones, a laptop at 300 - 400% zoom) the consent box sits at the top of the page instead of floating over it, so all of its text can be scrolled to (WCAG 1.4.10 Reflow). Before, it was taller than the window and its top was out of reach.

#### Changed

- `yarn a11y`, the scroll reveal e2e and the stories test check WCAG 2.2 A/AA (axe tags `wcag22a` and `wcag22aa`).
- `yarn a11y` hit-tests every Tab stop and reports the ones another element hides (2.4.11). It also tabs through four pages with the consent box showing, at phone, desktop and 400% zoom sizes, and checks at 400% zoom that all of the box can be scrolled to. Tab stops get the name a screen reader gives them: image alt text in, hidden text out.

## Release v5.0.0 - 2026-10-26

- The project planning case study no longer names its product: it has a new address, /work/project-planning, and the product's logo is gone from its screenshots.
- The other two case studies hide more client details: the theming case no longer shows its vendor's brand, and the automotive case blurs internal page names, survey counts, a dealer's sales figures and a persona's raw survey numbers.
- Search engines and other tools that read the page as text now see clean page labels and named case links.

Versions: 5.0.0.

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
