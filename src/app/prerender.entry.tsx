/**
 * Server-side entry for scripts/prerender.ts (built with `vite build --ssr`).
 * Renders the app for the current location into static HTML, plus the head data
 * of every page. Not part of the browser bundle.
 */
import { renderToString } from "react-dom/server";

import { App } from "./App/App.tsx";

export { VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
export { headFor, llmsTxt } from "./seo/seo.utils.ts";
export { applyHead, withRootContent } from "./seo/static-head.utils.ts";

/** HTML of the page at window.location (the prerender script sets it per page). */
export const renderPage = (): string => renderToString(<App />);
