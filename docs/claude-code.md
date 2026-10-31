# Working with Claude Code

Karolina designed the site in Figma and directed the build; the code was written with [Claude Code](https://claude.com/claude-code), Anthropic's coding agent. Commits that Claude wrote carry a `Co-Authored-By: Claude` trailer. This page shows how the repo is set up for that work.

## Project instructions: `CLAUDE.md`

Read by Claude at the start of every session. It holds what a new team member would need on day one:

- commands (`yarn verify` before every commit) and the folder layout (vertical slices, import aliases, file naming)
- design-token rules: only token utilities, no hex values, no `dark:` variants
- Karolina's copy rules: plain B2-level English, short hyphens, bold lead-ins, honest claims about roles and outcomes
- code conventions: strict TypeScript, React Compiler rules, tests next to the code
- the git workflow: work on `develop`, one version and changelog entry per commit, files staged by name, releases only on request

## Skills: `.claude/skills/`

Step-by-step routines that Claude loads when the task calls for them. They were chosen from the requests that came up again and again while the site was built (2026-10-26: 215 requests over 14 sessions). When to use which: [CONTRIBUTING.md](../CONTRIBUTING.md#claude-code-helpers).

| Skill                 | What it does                                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release`             | Releases `develop` to `main` when asked: release notes for visitors, `--no-ff` merge, tag, push, the Netlify deploy check (and what to do if it fails), caches to refresh. |
| `ship-change`         | Commits a finished change: verify, semver bump, changelog entry, own files only, version in the subject.                                                                   |
| `add-tracking`        | Adds an event or session property to the statistics: the question, the tracker's real behaviour, the privacy policy and consent decision, the tracking plan, tests.        |
| `update-dependencies` | Updates packages: peer ranges, React's resolutions, Windows file locks, then verify, Storybook, e2e and the accessibility audit.                                           |
| `sync-design-system`  | Keeps Figma, the tokens, the components and the KitaBranding design system on claude.ai in step.                                                                           |
| `record-rule`         | Saves a rule or lesson once, in the right place, with a test or lint guard where one fits.                                                                                 |

## Agents: `.claude/agents/`

Reviewers that run in their own context and only report:

| Agent                      | Reviews                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `a11y-reviewer`            | WCAG 2.2 AA: the changed files first, `yarn a11y` and the motion e2e, axe's undecided results, and a checklist of what tools miss.       |
| `ui-reviewer`              | A visible change against the design tokens, `shared/ui` and common UX patterns, with screenshots at 320, 768 and 1280 px in both themes. |
| `copy-reviewer`            | Copy against Karolina's writing rules, and facts (dates, employers, years) across pages.                                                 |
| `docs-seo-reviewer`        | Docs that no longer match the code, and each page's search and link-preview data in the build and on the live site.                      |
| `confidentiality-reviewer` | That no unapproved client or product name, logo or figure is published, without ever writing one down.                                   |
| `pattern-sweeper`          | Every other place with the root cause of a bug or finding, and the guard that would catch it.                                            |

## Tools Claude uses here

- **Figma** (MCP): reads the design and the KitaBranding variables; token changes start in Figma (see [design.md](design.md)).
- **Netlify** (MCP): checks that a release deployed.
- **Playwright**: real-browser checks that jsdom cannot see: layout, focus, scrolling, motion frame by frame, the image viewer's zoom and sharpness, and the statistics with the real tracker. They run in Chromium, Firefox, WebKit and an Android phone in Messenger's in-app browser.

## Guard rails

Claude works inside the same quality gate as a person: `yarn verify` (typecheck, zero-warning lint, format check, tests, build and prerender) must pass before every commit, and ESLint enforces the architecture. Releases and anything visible to others happen only when Karolina asks.
