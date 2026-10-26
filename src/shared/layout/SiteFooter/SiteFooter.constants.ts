import { PROFILE } from "#shared/content/profile.ts";

/** Read once per page load (rendering stays pure). */
export const CURRENT_YEAR = new Date().getFullYear();

/**
 * The site's version (package.json, set at build time by vite.config.ts), so a returning visitor can tell
 * whether anything changed since their last visit.
 */
export const SITE_VERSION = import.meta.env.APP_VERSION;

/** What changed in each version: CHANGELOG.md on main, newest release first. None without the public repo. */
export const RELEASE_NOTES_URL = PROFILE.repositoryUrl ? `${PROFILE.repositoryUrl}/blob/main/CHANGELOG.md` : null;
