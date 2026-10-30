import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { PathAndHash } from "#shared/lib/routes/routes.types.ts";
import { readRoute } from "#shared/lib/routes/routes.utils.ts";

import { PRERENDERED_VIEW_ATTRIBUTE } from "./hydration.constants.ts";

/**
 * Whether the app adopts the prerendered HTML in `root` (hydrateRoot in src/main.tsx) instead of rendering the
 * page again: the HTML is there and shows the view this address opens (an unknown address opens Work, as
 * useHistoryRoute does, and gets the Work HTML of 404.html). Not for an old hash link (/#about is served the
 * Work HTML but opens About), nor for an empty root (the dev server, a one-page build).
 */
export function adoptsPrerenderedHtml(root: HTMLElement, location: PathAndHash): boolean {
  const prerendered = root.getAttribute(PRERENDERED_VIEW_ATTRIBUTE);
  return root.firstElementChild !== null && prerendered === (readRoute(location).view ?? VIEW.work);
}
