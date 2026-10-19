import { VIEW, VIEW_ALIASES, VIEW_PATHS, VIEW_TITLES, VIEWS } from "./routes.constants.ts";
import type { LocationRoute, PathAndHash, View } from "./routes.types.ts";

/**
 * Reading and building URLs for views (paths and section hashes: routes.constants.ts).
 *
 * A one-page build (relative base, `vite build --base ./`, e.g. the claude.ai artifact) has
 * no other paths to load, so there the path travels in the hash: #/about, #/about#career.
 * src/main.tsx switches this on with setHashRouting(true).
 */

let hashRouting = false;

/** Path in the hash (#/about) instead of the URL path. Set once, before the app renders. */
export const setHashRouting = (on: boolean): void => {
  hashRouting = on;
};

export const isView = (value: string): value is View => (VIEWS as readonly string[]).includes(value);

/** Resolves a view id or alias, or null when it names none. */
export const resolveView = (value: string): View | null => {
  if (isView(value)) return value;
  return Object.hasOwn(VIEW_ALIASES, value) ? (VIEW_ALIASES[value] ?? null) : null;
};

const trimSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The view at a URL path, or null for an unknown path. */
export const viewForPath = (pathname: string): View | null => {
  const path = trimSlash(pathname).toLowerCase();
  const match = VIEWS.find((view) => VIEW_PATHS[view] === path);
  if (match) return match;
  const segment = path.replace(/^\//, "");
  return segment.includes("/") ? null : resolveView(segment);
};

const decodeHash = (hash: string): string => {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return ""; // malformed percent-encoding
  }
};

/** The path and section hash a location stands for; with hash routing both come from the hash. */
const routedLocation = ({ pathname, hash }: PathAndHash): PathAndHash => {
  if (!hashRouting) return { pathname, hash };
  const fragment = hash.replace(/^#/, "");
  if (!fragment.startsWith("/")) return { pathname: "/", hash }; // empty, or an old view hash (#about)
  const split = fragment.indexOf("#");
  return split < 0
    ? { pathname: fragment, hash: "" }
    : { pathname: fragment.slice(0, split), hash: fragment.slice(split) };
};

/** Reads view and anchor from a location; an old view hash on the root (/#about) wins over the path. */
export const readRoute = (location: PathAndHash): LocationRoute => {
  const { pathname, hash } = routedLocation(location);
  const view = viewForPath(pathname);
  const fragment = decodeHash(hash);
  if (view === VIEW.work && fragment) {
    const legacy = resolveView(fragment);
    if (legacy) return { view: legacy, anchor: null };
  }
  return { view, anchor: fragment || null };
};

/** Link target of a view, with an optional section anchor (#/about#career with hash routing). */
export const hrefForView = (view: View, anchor?: string | null): string => {
  const target = VIEW_PATHS[view] + (anchor ? "#" + anchor : "");
  return hashRouting ? "#" + target : target;
};

/** Address-bar URL of a view on the current page; keeps the query string (e.g. ?ref=cv). */
export const urlForView = (
  view: View,
  anchor: string | null,
  { pathname, search }: Pick<Location, "pathname" | "search">,
): string =>
  hashRouting
    ? pathname + search + hrefForView(view, anchor)
    : VIEW_PATHS[view] + search + (anchor ? "#" + anchor : "");

/** The current URL with its section anchor swapped (null drops it). */
export const urlWithAnchor = (
  location: Pick<Location, "pathname" | "search" | "hash">,
  anchor: string | null,
): string => {
  const { pathname, search } = location;
  if (!hashRouting) return pathname + search + (anchor ? "#" + anchor : "");
  return pathname + search + "#" + routedLocation(location).pathname + (anchor ? "#" + anchor : "");
};

/** True for a case-study view (case-meetestim, ...). */
export const isCaseView = (view: View): boolean => view.startsWith("case-");

/** Case studies live under Work, so the Work pill stays active there. */
export const navSectionFor = (view: View): View => (isCaseView(view) ? VIEW.work : view);

export const titleForView = (view: View): string => VIEW_TITLES[view];
