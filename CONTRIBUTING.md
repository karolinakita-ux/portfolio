# Contributing

How work moves from a commit to the live site at karolina.kita.company.

## Branches

| Branch    | What it is                                                           | Who pushes                  |
| --------- | -------------------------------------------------------------------- | --------------------------- |
| `develop` | Day-to-day work. Every commit lands here.                            | Anyone, after `yarn verify` |
| `main`    | The live site. Netlify publishes every push to `main` to production. | Release merges only (below) |

- Never commit straight to `main`. It changes only in a release.
- Netlify builds and deploys only `main`. Pushes to `develop` and pull requests are never built or deployed anywhere, so pushing `develop` costs nothing. In Netlify: Project configuration → Build & deploy → Continuous deployment → Branches and deploy contexts → Branch deploys: "Deploy only the production branch", Deploy Previews: "None". `netlify.toml` backs this up: its `ignore` command stops any build outside the production context.
- Check a change before a release on your own machine: `yarn dev`, or `yarn build && yarn preview` for the production build with prerendered pages.

## Every commit

1. Run `yarn verify` (typecheck, lint, format check, tests, build and prerender). Fix anything that fails. After UI, motion or theme changes, also run `yarn e2e` (Playwright in Chromium, Firefox and WebKit); it is not part of `yarn verify` or the Netlify build.
2. Bump `version` in `package.json` (rules below).
3. Add an entry for that version under `## Unreleased` in `CHANGELOG.md`. Create the heading above the newest release if it is missing.
4. Stage only the files you changed, by name. Do not use `git add -A`: someone may have unfinished edits in the same folder.
5. Commit to `develop` and push. Put the version in the commit subject, e.g. `Add zoom to the image viewer (1.1.0)`.
6. Credit co-authors with trailers at the end of the message. Engineering commits (code structure, refactors, tooling, libraries) carry `Co-authored-by: Mateusz Kita <mkita.webdev@gmail.com>`; commits written with Claude carry its trailer too.

By contributing, you license your contribution to Karolina Kita as [LICENSE](LICENSE) describes (Contributions); you keep the copyright in it.

New code follows the file and folder rules in [docs/architecture.md](docs/architecture.md#files-and-folders): one component per folder with its `*.types.ts` and `*.styles.ts`, one folder per domain for other modules, files under 200 lines. ESLint enforces the slice boundaries, the class rule and the length cap. A new shared component gets a story next to it (`Name.stories.tsx`); `src/test/stories.test.tsx` fails without one.

### Version rules ([Semantic Versioning](https://semver.org/))

If a commit mixes changes, use the highest level.

- **Major** (`2.0.0`) - breaks old links or rebuilds the site: removed or renamed pages, changed URLs, a full redesign.
- **Minor** (`1.1.0`) - new visible content or features: a case study, page, section, component or new images.
- **Patch** (`1.0.1`) - fixes and small edits: copy, alt text, image swaps or optimisation, styling, dependencies, config, tests, docs.

### Changelog entry

```md
### 1.1.0 - 2026-10-12

#### Added

- Zoom buttons in the image viewer.

#### Fixed

- Thumbnails no longer stretch on narrow phones.
```

Groups, in this order, only the ones you need: `Added`, `Changed`, `Fixed`, `Removed`. One line per change, past or present tense, plain words. Dates are ISO (`YYYY-MM-DD`). Short hyphens only, never en or em dashes.

## Releases (`develop` to `main`)

A release puts everything waiting on `develop` live. It happens only when Karolina asks for it.

The release commit and the merge do not bump the version. The release is named after the newest version under `## Unreleased`, which matches `package.json`.

### 1. Check what ships

```sh
git switch develop
git pull --ff-only
yarn verify
git log --oneline main..develop
```

Every commit in that log should have its version under `## Unreleased`. If something is missing, add it before going on.

Then date the sitemap: in `public/sitemap.xml`, set `<lastmod>` to the release date (today) for every page whose visible content or structured data changed since `origin/main` (`git diff --stat origin/main..develop` shows what changed; the footer's version number does not count). Commits on `develop` set the day they were made, which is too early once the release comes later, so check every changed page, not only the ones without today's date. The file goes into the release commit with `CHANGELOG.md`.

### 2. Write the release notes

In `CHANGELOG.md`, rename `## Unreleased` to `## Release vX.Y.Z - YYYY-MM-DD` (today's date) and write the notes right under it, above the first `###` entry:

1. Read every `###` entry being released.
2. Write for a visitor or a recruiter, not a developer: what is new or different on the site.
3. Use 2 to 6 bullets, most visible first: new content, then visible changes, then fixes. Fold behind-the-scenes work (tooling, tests, docs, config) into one bullet such as "Faster page loads and better search results", or leave it out.
4. One sentence per bullet. No file names, commit hashes or tool names unless a reader needs them.
5. Add a one-line opener only if the release has a clear theme.
6. End with `Versions: a - b.` (oldest - newest).
7. Same copy rules as the site: plain, honest, B2-level English, short hyphens.

Example:

```md
## Release v1.1.0 - 2026-10-12

- Screenshots in case studies can be zoomed in the image viewer.
- The About page has a new timeline of roles since 2018.
- Thumbnails no longer stretch on narrow phones.
- Better search results: clearer page descriptions and a sitemap.

Versions: 1.0.3 - 1.1.0.
```

### 3. Merge, tag and push

```sh
git add CHANGELOG.md public/sitemap.xml
git commit -m "Release vX.Y.Z"
git push origin develop

git switch main
git pull --ff-only
git merge --no-ff develop -m "Release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --follow-tags

git switch develop
git merge --ff-only main
git push origin develop
```

`--no-ff` keeps one merge commit per release on `main`, so `git log --first-parent main` reads as a list of releases. The last step moves `develop` onto that merge, so the two branches do not drift apart.

### 4. Check it is live

Netlify builds `main` (tests run first; a failing test stops the deploy). Check that the production deploy for the release commit says Published in Netlify, then open https://karolina.kita.company.

### 5. Refresh what other services cached

Only when the release changed what they show: a page's title or description, the link-preview image (`public/assets/site/og-image.png`), the site icon, or a page's address. The pages are listed in `public/sitemap.xml`.

| Service                              | Tool                                         | What to do                                                                                                                                                               |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LinkedIn (posts, messages)           | https://www.linkedin.com/post-inspector/     | Enter each page you will share, starting with `https://karolina.kita.company/`, and press Inspect: LinkedIn fetches it again and shows the new preview.                  |
| Facebook, Messenger, Instagram links | https://developers.facebook.com/tools/debug/ | Enter the same addresses, press Debug, then Scrape Again.                                                                                                                |
| Google Search                        | https://search.google.com/search-console     | URL inspection (the search box at the top): enter each changed page, then Request indexing. Sitemaps: submit `sitemap.xml` when pages were added or their dates changed. |
| Google: structured data              | https://search.google.com/test/rich-results  | Enter a page's address to see what Google reads from its structured data.                                                                                                |
| Bing and Copilot                     | https://www.bing.com/webmasters              | URL Submission: the changed pages (the site has to be added there once).                                                                                                 |

Google shows a new site icon only after it recrawls the home page, which can take days to weeks. Apps without a refresh button (WhatsApp, Slack, Teams, X) fetch a new preview for a new address, so share the page with a fresh tag such as `?ref=linkedin-post`.

### Urgent fixes

Fix on `develop` as usual (patch version), then make a release with just that fix. Do not patch `main` directly.

## Claude Code helpers

Claude Code loads these from `.claude/` ([docs/claude-code.md](docs/claude-code.md) explains the setup). A skill is a routine Claude follows in the conversation; an agent reviews in its own context and only reports. Ask for one by name ("run the ui-reviewer"), or Claude picks it when the task matches.

| Helper                     | Kind  | Use it when                                                                                                |
| -------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| `ship-change`              | skill | a change is ready to commit: verify, version, changelog, only your own files                               |
| `release`                  | skill | you ask for a release: notes, merge, tag, deploy check, the caches to refresh                              |
| `add-tracking`             | skill | something new goes to the visitor statistics: an event or a session property                               |
| `update-dependencies`      | skill | the packages should be updated                                                                             |
| `sync-design-system`       | skill | a token or component changed in Figma, the code or the claude.ai design system, and the others must follow |
| `record-rule`              | skill | you say "remember", "note it" or "add it to the rules"                                                     |
| `ui-reviewer`              | agent | after a visible UI change: tokens, components, UX patterns, phone and desktop, both themes                 |
| `a11y-reviewer`            | agent | after UI changes and before a release: WCAG 2.2 AA                                                         |
| `copy-reviewer`            | agent | after copy, page descriptions or release notes change                                                      |
| `docs-seo-reviewer`        | agent | after a batch of changes or before a release: stale docs, search and link-preview data                     |
| `confidentiality-reviewer` | agent | before a release or a public share, and after new screenshots or case-study copy                           |
| `pattern-sweeper`          | agent | after a bug or a finding: the same root cause anywhere else, and a guard against it                        |

Before a release with visible changes, a good order is `docs-seo-reviewer`, `confidentiality-reviewer` and `a11y-reviewer`, then `release`. Skills named `local-*` are personal (they use private notes) and stay out of the repo.
