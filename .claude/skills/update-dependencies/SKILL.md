---
name: update-dependencies
description: Update the packages in package.json safely - the outdated list, peer ranges, React's resolutions, Windows file locks - then verify, build Storybook, run the e2e suite and the accessibility audit. Use when asked to update packages, dependencies or versions.
---

# Update dependencies

1. **List** with `yarn outdated`. For a major update, read its release notes and the peer ranges of what depends on it (`yarn info <pkg>@<version> peerDependencies`):
   - typescript-eslint's `typescript` range decides the TypeScript version.
   - The four Storybook packages move together, pinned to one exact version.
   - `@axe-core/playwright` bundles its own axe-core: keep it on the same minor as `axe-core`.
   - A major that a peer range does not allow yet waits; say which and why.
2. **React** is pinned twice, in `dependencies` and in `resolutions` (one copy of React, CLAUDE.md Pitfalls). Change both, then run `yarn install` before `yarn upgrade`, because yarn 1 refuses an outdated lockfile.
3. **Upgrade** and raise the minimums in package.json: `yarn upgrade <pkg>@^x.y.z ...`, exact versions where the repo pins them (Storybook, axe-core, @fontsource). On Windows, `EPERM: operation not permitted, unlink ...node` means a running Vite, Vitest or Storybook process holds a native file. Find it (`Get-CimInstance Win32_Process -Filter "Name = 'node.exe'"`, then its parents); if it is the user's own dev server, say so before you stop it. It needs a restart after the upgrade anyway.
4. **Check** that one React is installed (`node_modules/react` only) and that no new peer warning appeared.
5. **Verify:** `yarn verify`; `yarn build-storybook`; `yarn playwright install chromium firefox webkit` after a Playwright bump; the full `yarn e2e --workers 2`; and `yarn a11y` after an axe bump, since a new axe can switch on rules. Read every failure before changing anything.
6. **Commit** with `ship-change`: one commit, a patch version, a changelog line naming each package and version, and any major left out with the reason.
