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

Step-by-step routines that Claude loads when the task calls for them:

| Skill         | What it does                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/release`    | Releases `develop` to `main`: release notes for visitors, `--no-ff` merge, tag, push, then checks the Netlify deploy. Only when asked. |
| `ship-change` | Commits a finished change: verify, semver bump, changelog entry, own files only, version in the subject.                               |

## Agents: `.claude/agents/`

Reviewers that run in their own context and only report:

| Agent           | Reviews                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| `a11y-reviewer` | Runs `yarn a11y` and reads the screen reader transcripts and Tab orders against WCAG 2.1 AA. |
| `copy-reviewer` | Copy against Karolina's writing rules, and facts (dates, employers, years) across pages.     |

## Tools Claude uses here

- **Figma** (MCP): reads the design and the KitaBranding variables; token changes start in Figma (see [design.md](design.md)).
- **Netlify** (MCP): checks that a release deployed.
- **Playwright**: real-browser checks of layout, focus and scrolling that jsdom cannot see.

## Guard rails

Claude works inside the same quality gate as a person: `yarn verify` (typecheck, zero-warning lint, format check, tests, build and prerender) must pass before every commit, and ESLint enforces the architecture. Releases and anything visible to others happen only when Karolina asks.
