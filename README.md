# Karolina Kita - portfolio

Source of [karolina.kita.company](https://karolina.kita.company), the portfolio of Karolina Kita, Senior Product Designer. Designed in Figma ([design source](docs/design.md)) and built with Claude Code: React 19, TypeScript, Tailwind CSS v4 (KitaBranding design tokens), Vite, Vitest. Deployed on Netlify from the `main` branch (releases only; work happens on `develop`).

## Setup (Windows 11)

```powershell
fnm use            # Node version from .node-version
yarn               # install
yarn dev           # http://localhost:5173
```

## Scripts

| Command        | What it does                                                     |
| -------------- | ---------------------------------------------------------------- |
| `yarn dev`     | Dev server with hot reload                                       |
| `yarn verify`  | Typecheck + lint + tests + production build (run before pushing) |
| `yarn test`    | Vitest watch mode (`yarn test:run` for a single run)             |
| `yarn build`   | Typecheck and build to `dist/`                                   |
| `yarn preview` | Serve the production build locally                               |
| `yarn format`  | Prettier (sorts Tailwind classes too)                            |

## Where things live

```
index.html                     <head>: title, description, link-preview tags, theme script
public/                        copied as-is: favicon.svg, _headers, assets/ (images)
src/app/                       shell: App, routing, cross-feature copy tests
src/features/<name>/           one slice per page: view, components, copy (*.content.ts), types, tests
src/shared/                    ui/, layout/, media/, hooks/, lib/, content/ - used by several slices
src/styles/tokens.css          KitaBranding tokens (light / dark)
src/styles/app.css             Tailwind theme mapped to the tokens
src/styles/kita-branding.tokens.json   Figma Variables export (tests keep tokens.css in sync)
docs/                          project docs, e.g. the design source in Figma
```

## Tests

- `src/app/content-rules.test.ts` - copy rules (hyphens, bold lead-ins, no trailing period on H1s), navigation links, image file names.
- `src/styles/tokens.test.ts` - every CSS token matches the Figma export, in both modes.
- `src/app/App.test.tsx` - navigation, theme toggle, history; other tests sit next to the file they cover.

## Close-up images on case-study cards

Screenshots are small on the cards. Each card accepts an optional close-up:

```ts
{
  id: "roadmap",
  asset: "project-planning-08-roadmap-gantt-goals-decomposition.png",          // full screen, opens in the viewer
  detail: "project-planning-08-roadmap-gantt-goals-decomposition--detail.png", // close-up shown on the card
}
```

If the close-up file is missing, the card shows the full screenshot.

## Deploy

Day-to-day work goes to `develop`; `main` is the live site and changes only in a release. Branches, versions, changelog and the release steps: [CONTRIBUTING.md](CONTRIBUTING.md).

Netlify is linked to this repository: every push to `main` runs `yarn test:run && yarn build` and publishes `dist/`. A failing test blocks the deploy. `develop` and pull requests get preview URLs.

Link previews are cached by apps: check LinkedIn at https://www.linkedin.com/post-inspector after changing `og-image.png`.
