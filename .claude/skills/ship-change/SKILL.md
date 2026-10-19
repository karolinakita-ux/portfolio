---
name: ship-change
description: Commit a finished change on develop the way this repo expects - yarn verify, semver bump, CHANGELOG entry, own files staged by name, version in the subject, push. Use whenever a change is ready to commit.
---

# Ship a change on `develop`

Every commit is one version. Rules in `CONTRIBUTING.md` ("Every commit"); the short form:

1. **Verify.** `yarn verify` (typecheck, lint with zero warnings, Prettier check, tests, build with prerender). Fix the code, not the rules: a rule exception is a one-line disable with a reason after `--`.
2. **Check the tree.** `git status`. The user may have unfinished edits: list only the files this change touched. Leave everything else unstaged.
3. **Pick the version right before committing** (read `version` in `package.json` and the top of `CHANGELOG.md` now, not earlier):
   - major: removed or renamed pages, changed URLs, a redesign
   - minor: new visible content or features
   - patch: fixes, copy, images, styling, dependencies, config, tests, docs
4. **Changelog.** Add `### X.Y.Z - YYYY-MM-DD` under the single `## Unreleased` heading (after a release it is gone: add it above the newest `## Release`), with `Added` / `Changed` / `Fixed` / `Removed` groups, one plain line each, short hyphens only.
5. **Commit** the listed files by name: `git commit -- <files>` with the subject `<what changed, imperative> (X.Y.Z)`, a short body, and the co-author trailer if Claude wrote it. Engineering commits (structure, refactors, tooling, libraries) also get `Co-authored-by: Mateusz Kita <mkita.webdev@gmail.com>` (CONTRIBUTING.md, Every commit).
6. **Check the commit** against its message: `git show --stat HEAD`. Then push `develop`.

Before committing, list every changed unit (file, function, branch) next to the test that covers it. An untested branch gets a test, or a note in the reply.
