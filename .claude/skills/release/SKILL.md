---
name: release
description: Release develop to main (the live site) - release notes, merge, tag, push, then check the Netlify production deploy and list the caches to refresh. Use only when the user asks for a release in this conversation ("release", "/release", "merge to main", "put it live"); never start one on your own.
---

# Release `develop` to `main`

A release puts everything waiting on `develop` live at karolina.kita.company. Only `main` is ever built or deployed. The full process and the release-notes rules are in `CONTRIBUTING.md` ("Releases"); follow it step by step.

1. **Check what ships.** On `develop`: `git fetch origin`, `git pull --ff-only`, `yarn verify`. Show `git log --oneline origin/main..develop` and the `## Unreleased` entries. Stop and ask if verify fails, if a commit has no changelog entry, or if `origin/main` has commits that `develop` lacks. Then set `<lastmod>` in `public/sitemap.xml` to today for every page whose visible content or structured data changed since `origin/main` (`git diff --stat origin/main..develop`; the footer's version number does not count): dates written on `develop` are the commit's day, too early for a later release.
2. **Write the release notes** under a renamed heading `## Release vX.Y.Z - YYYY-MM-DD` (today, ISO). The version is the newest one under `## Unreleased`, which matches `package.json`. No version bump for the release itself. Notes are for visitors and recruiters: 2 to 6 bullets, plain B2 English, short hyphens, and end with `Versions: a - b.`
3. **Merge, tag and push**, exactly as in `CONTRIBUTING.md`: commit `CHANGELOG.md` and `public/sitemap.xml` only, as `Release vX.Y.Z`, merge `develop` into `main` with `--no-ff`, annotated tag `vX.Y.Z`, push `main` with tags, fast-forward `develop` to `main` and push it.
4. **Check the deploy** with the Netlify MCP (project `karolina-kita`): the production deploy's `commit_ref` is the release merge and its state is ready, then fetch one page that the release changed from the live site (`curl`; prerendered text such as `Version <!-- -->5.3.0` has React's comment in it).
   - The MCP needs a deploy id to read a deploy. If the live site still shows the old release a few minutes after the push, do not guess why: ask the user for the deploy log (Netlify → Deploys → the failed deploy) or its id.
   - If the build failed, read the log, reproduce it locally with the production command from `netlify.toml` on a fresh clone if needed, fix it on `develop` as an urgent fix (a patch version, CONTRIBUTING.md), and release again. Read Vitest's "Unhandled Errors" block too: it fails a run in which every test passed.
5. **List the caches to refresh** when the release changed a page's title, description, the link-preview image or the site icon: the pages and the tool for each (CONTRIBUTING.md, release step 5).
6. **Reply** with the version, the release notes as written, the deploy result, and the refresh list. If the user keeps a claude.ai copy of the site, offer to update it.

Rules:

- Uncommitted user edits stay out of the release. If `git switch` refuses because of them, stop and ask; never stash, reset or discard them.
- Stage files by name; never `git add -A`.
