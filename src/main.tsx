import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "#app/App/App.tsx";
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

createRoot(root).render(
  <StrictMode>
    {/* Follows Vite's base: "/assets" on the site, "./assets" in a relative build (e.g. a claude.ai artifact). */}
    <App assetBase={import.meta.env.BASE_URL + "assets"} />
  </StrictMode>,
);
