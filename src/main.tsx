import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { App } from "#app/App/App.tsx";
import { adoptsPrerenderedHtml } from "#app/hydration/hydration.utils.ts";
import { notePageNotFound } from "#shared/lib/analytics/analytics.utils.ts";
import { browserSignals, initStatistics } from "#shared/lib/analytics/statistics-consent.utils.ts";
import { readRoute, setHashRouting } from "#shared/lib/routes/routes.utils.ts";

// Self-hosted fonts (no request to Google): only the weights the type scale uses.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/zilla-slab/400.css";
import "@fontsource/zilla-slab/500.css";
import "./styles/app.css";

// A one-page build (relative base, e.g. a claude.ai artifact) has no other paths: the view goes in the hash.
setHashRouting(import.meta.env.BASE_URL === "./");

// An address that matches no page shows Work, and useHistoryRoute replaces it with /: the statistics keep it.
if (readRoute(window.location).view === null) notePageNotFound(window.location.pathname);

// Visitor statistics (Umami): the live site only, never in dev, previews or the artifact build, and only
// after the visitor allows them (the consent box). The dev server shows the box on every load (preview),
// except in automated browsers (Playwright e2e and yarn a11y), whose checks expect the page alone.
initStatistics({
  production: import.meta.env.PROD,
  base: import.meta.env.BASE_URL,
  hostname: window.location.hostname,
  privacy: browserSignals(),
  preview: import.meta.env.DEV && !navigator.webdriver,
  release: import.meta.env.APP_VERSION,
});

const root = document.getElementById("root");
if (!root) throw new Error('Missing <div id="root"> in index.html');

// The same element as the prerender (src/app/prerender.entry.tsx). Images follow Vite's base (ASSET_BASE).
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// A prerendered page (scripts/prerender.ts) stays as it is: React adopts its elements (hydration) instead of
// building the page again, so nothing is repainted, no image reloads and the largest paint is not recorded twice.
// The app's first render therefore matches that HTML: what it can only know in the browser (the statistics
// choice, the consent box, a dark page's themed images) follows right after. An address that opens another view
// than its HTML (an old hash link) and an empty root (the dev server, a one-page build) get the page rendered anew.
if (adoptsPrerenderedHtml(root, window.location)) hydrateRoot(root, app);
else createRoot(root).render(app);
