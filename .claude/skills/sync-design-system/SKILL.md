---
name: sync-design-system
description: Bring a design token or component change into line across Figma, the code, Storybook and the KitaBranding design system on claude.ai. Use when a token or component changed in only one of them, or when the user says they changed something in Figma.
---

# Keep Figma, the code and the design system in step

The token chain runs one way: Figma Variables → `src/styles/kita-branding.tokens.json` → `src/styles/tokens.css` (light and dark; motion tokens once) → `src/styles/theme.css` → the KitaBranding design system on claude.ai. Rules: CLAUDE.md (Design tokens) and `docs/design.md`.

1. **Find the change.** If it is not clear where it was made, ask. Read the Figma variable or component with the Figma MCP (variable definitions, design context, a screenshot) and compare it with the code.
2. **Tokens:** update the export (`kita-branding.tokens.json`), then `tokens.css` in both modes, then the mapping in `theme.css` for a new token. `src/styles/tokens.test.ts` keeps `tokens.css` 1:1 with the export, and `motion-tokens.test.ts` checks the motion names.
3. **Components:** change the component's `*.styles.ts` (variants named as in Figma), its story (real copy) and its test.
4. **Check the views that use it:** `yarn verify`, then the `ui-reviewer` agent for screenshots at 320, 768 and 1280 px in both themes.
5. **The KitaBranding design system on claude.ai:** read it first, change `project/tokens.json` and the README where a rule changed, set the index's `lastChange`, and publish once. Afterwards compare every resolved colour with `tokens.css` in both modes.
6. **Figma:** edit the Figma file only when the user asks. Otherwise write a task for Karolina (where, what, why) on her task page.
7. **Commit** with `ship-change`.
