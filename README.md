# K.Kita Portfolio - karolina.kita.company

Karolina Kita's portfolio: React 19, TypeScript, Tailwind CSS v4 (KitaBranding design tokens), Vite, Vitest. Deployed on Netlify from the `main` branch (releases only; work happens on `develop`).

## Setup (Windows 11)

```powershell
fnm use            # Node version from .node-version
yarn               # install
yarn dev           # http://localhost:5173
```

Copy Karolina's images into `public/assets/` once (case-study screenshots, thumbnails, `avatar-cutout.png`, `og-image.png`). Without them the site still works and shows placeholder frames.

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
src/content/                   all copy (typed in types.ts) - most edits happen here
src/views/                     the pages: Work, About, Contact, case studies, CV, cover letter
src/components/                ui/, layout/, media/, case/, icons.tsx
src/hooks/                     theme, history routing, image loading, scroll position
src/lib/                       routes, class helpers, dates, A4 page-fit maths
src/styles/tokens.css          KitaBranding tokens (light / dark)
src/styles/app.css             Tailwind theme mapped to the tokens
src/styles/kita-branding.tokens.json   Figma Variables export (tests keep tokens.css in sync)
```

## Tests

- `src/content/content.test.ts` - copy rules (hyphens, bold lead-ins, no trailing period on H1s), navigation links, image file names.
- `src/styles/tokens.test.ts` - every CSS token matches the Figma export, in both modes.
- `src/lib/*.test.ts`, `src/hooks/*.test.ts` - routing, dates, theme, history.
- `src/App.test.tsx`, `src/components/**` - navigation, theme toggle, image viewer, copy-email, buttons.

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
