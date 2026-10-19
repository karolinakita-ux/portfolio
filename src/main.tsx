import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "#app/App/App.tsx";
import { startAnalytics } from "#shared/lib/analytics/analytics.utils.ts";
import { visitorPrivacy } from "#shared/lib/analytics/statistics-switch.utils.ts";
import { setHashRouting } from "#shared/lib/routes/routes.utils.ts";

// Self-hosted fonts (no request to Google): only the weights the type scale uses.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/zilla-slab/400.css";
import "@fontsource/zilla-slab/500.css";
import "./styles/app.css";

// A one-page build (relative base, e.g. a claude.ai artifact) has no other paths: the view goes in the hash.
setHashRouting(import.meta.env.BASE_URL === "./");

// Visitor statistics (Umami): the live site only, never in dev, previews or the artifact build.
startAnalytics({
  production: import.meta.env.PROD,
  base: import.meta.env.BASE_URL,
  hostname: window.location.hostname,
  privacy: visitorPrivacy(),
});

const root = document.getElementById("root");
if (!root) throw new Error('Missing <div id="root"> in index.html');

createRoot(root).render(
  <StrictMode>
    {/* Follows Vite's base: "/assets" on the site, "./assets" in a relative build (e.g. a claude.ai artifact). */}
    <App assetBase={import.meta.env.BASE_URL + "assets"} />
  </StrictMode>,
);
