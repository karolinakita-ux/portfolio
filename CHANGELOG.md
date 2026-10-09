# Changelog

Every commit that changes `version` in `package.json` adds an entry here, newest first.
Versions follow [Semantic Versioning](https://semver.org/):

- **Major** - breaks old links or rebuilds the site: removed or renamed pages, changed URLs, a full redesign.
- **Minor** - new visible content: a case study, page, section, component or new images.
- **Patch** - fixes and small edits: copy, alt text, image swaps or optimisation, styling, dependencies, config, tests, docs.

## 1.0.1 - 2026-10-09

### Changed

- Resized `automotive-prototype-audit-tracker.png` from 20274 px to 3000 px wide (32 MB to 1.6 MB).
- Resized `automotive-hifi-screens-documentation.png` from 14370 px to 4000 px wide (2.9 MB to 0.8 MB).

### Added

- This changelog.

## 1.0.0 - 2026-10-09

### Added

- Portfolio rebuilt in React 19, TypeScript and Tailwind v4 on Vite, replacing the Vite starter.
- Work, About and case-study pages for the theming system, Project Planning and automotive projects.
- KitaBranding design tokens (light and dark) kept in sync with the Figma export by tests.
- Case-study images, Work page thumbnails, portrait and Open Graph image in `public/assets/`.
- New favicon.
- Netlify config: tests run before every build, hashed bundles cached for a year, security headers.

### Changed

- The benchmarking card in the automotive case study uses `automotive-competitive-benchmarking-notes.png`.
