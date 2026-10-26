---
name: record-rule
description: Save a rule, preference or lesson the user gives ("remember", "note it", "add it to the rules", "make sure this never happens again") in the right place, once, with a check when the rule can be tested. Use whenever the user asks to remember something or to add it to the instructions.
---

# Record a rule

1. **Look first.** Search CLAUDE.md, CONTRIBUTING.md, `docs/`, `.claude/` and Claude's memory for the rule. Update an existing entry rather than adding a second one. If the new rule contradicts an old one, say which wins.
2. **Pick the place:**
   - How Claude should work with this user (a preference, a habit): Claude's memory.
   - A rule for anyone who changes the repo (code, copy, design, tests): CLAUDE.md, in the section it belongs to, and CONTRIBUTING.md when a person follows it too.
   - A process step (commits, releases, deploys): CONTRIBUTING.md and the skill that runs it.
   - Something that went wrong and how it was fixed: Claude's local lessons log, newest first (What happened, Fix, Rule from now on).
3. **Make it checkable** when a test or lint rule can enforce it: add the guard next to the code (the content-rules, plain-text, tokens or tracking-plan tests, an ESLint rule), and prove it with one probe that must fail and one that must pass, in new temporary files deleted afterwards.
4. **Keep it public-safe:** CLAUDE.md, CONTRIBUTING.md, `docs/` and `.claude/` are in a public repo. Client or product names, private links and personal data go to memory or `docs/_*` instead.
5. **Reply** with where it was saved, one line per place. Repo changes are committed with `ship-change`.
