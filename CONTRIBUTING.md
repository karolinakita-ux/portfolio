# Contributing

How work moves from a commit to the live site at karolina.kita.company.

## Branches

| Branch    | What it is                                                           | Who pushes                  |
| --------- | -------------------------------------------------------------------- | --------------------------- |
| `develop` | Day-to-day work. Every commit lands here.                            | Anyone, after `yarn verify` |
| `main`    | The live site. Netlify publishes every push to `main` to production. | Release merges only (below) |

- Never commit straight to `main`. It changes only in a release.
- Netlify builds `develop` as a branch deploy at `https://develop--karolina-kita.netlify.app` (behind Netlify team login), so changes can be checked before a release. Enable it once in Netlify: Project configuration → Build & deploy → Branches and deploy contexts → Branch deploys → add `develop`.

## Every commit

1. Run `yarn verify` (typecheck, lint, format check, tests, build and prerender). Fix anything that fails. After UI, motion or theme changes, also run `yarn e2e` (Playwright in Chromium, Firefox and WebKit); it is not part of `yarn verify` or the Netlify build.
2. Bump `version` in `package.json` (rules below).
3. Add an entry for that version under `## Unreleased` in `CHANGELOG.md`. Create the heading above the newest release if it is missing.
4. Stage only the files you changed, by name. Do not use `git add -A`: someone may have unfinished edits in the same folder.
5. Commit to `develop` and push. Put the version in the commit subject, e.g. `Add zoom to the image viewer (1.1.0)`.
6. Credit co-authors with trailers at the end of the message. Engineering commits (code structure, refactors, tooling, libraries) carry `Co-authored-by: Mateusz Kita <mkita.webdev@gmail.com>`; commits written with Claude carry its trailer too.

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
git add CHANGELOG.md
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

### Urgent fixes

Fix on `develop` as usual (patch version), then make a release with just that fix. Do not patch `main` directly.
