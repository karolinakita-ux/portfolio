import { PROFILE } from "#shared/content/profile.ts";

/**
 * The copyright year: the year of the build (vite.config.ts), not of the visit, so the prerendered HTML and the
 * app that adopts it show the same year (a different one would be a hydration mismatch).
 */
export const COPYRIGHT_YEAR = import.meta.env.APP_BUILD_YEAR;

/**
 * The site's version (package.json, set at build time by vite.config.ts), so a returning visitor can tell
 * whether anything changed since their last visit.
 */
export const SITE_VERSION = import.meta.env.APP_VERSION;

/** What changed in each version: CHANGELOG.md on main, newest release first. None without the public repo. */
export const RELEASE_NOTES_URL = PROFILE.repositoryUrl ? `${PROFILE.repositoryUrl}/blob/main/CHANGELOG.md` : null;
