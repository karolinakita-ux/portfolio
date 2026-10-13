---
name: release
description: Release develop to main (the live site): release notes, merge, tag, push, and check the Netlify production deploy. Run only when Karolina asks for a release.
disable-model-invocation: true
---

# Release `develop` to `main`

A release puts everything waiting on `develop` live at karolina.kita.company. The full process and the release-notes rules are in `CONTRIBUTING.md` ("Releases"); follow it step by step.

1. **Check what ships.** On `develop`: `git fetch origin`, `git pull --ff-only`, `yarn verify`. Show `git log --oneline origin/main..develop` and the `## Unreleased` entries. Stop and ask if verify fails, if a commit has no changelog entry, or if `origin/main` has commits that `develop` lacks.
2. **Write the release notes** under a renamed heading `## Release vX.Y.Z - YYYY-MM-DD` (today, ISO). The version is the newest one under `## Unreleased`, which matches `package.json`. No version bump for the release itself. Notes are for visitors and recruiters: 2 to 6 bullets, plain B2 English, short hyphens, and end with `Versions: a - b.`
3. **Merge, tag and push**, exactly as in `CONTRIBUTING.md`: commit `CHANGELOG.md` only as `Release vX.Y.Z`, merge `develop` into `main` with `--no-ff`, annotated tag `vX.Y.Z`, push `main` with tags, fast-forward `develop` to `main` and push it.
4. **Check the deploy** with the Netlify MCP (project `karolina-kita`): the production deploy's `commit_ref` is the release merge and its state is ready. If it failed, read the deploy log and report. Then fetch one page that the release changed from the live site.
5. **Reply** with the version, the release notes as written, and the deploy result.

Rules:

- Uncommitted user edits stay out of the release. If `git switch` refuses because of them, stop and ask; never stash, reset or discard them.
- Stage files by name; never `git add -A`.
