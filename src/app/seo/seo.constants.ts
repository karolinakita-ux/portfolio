import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

export const SITE_URL = "https://karolina.kita.company";

/** JSON-LD ids of the site-wide Person and WebSite (declared in index.html). */
export const PERSON_ID = SITE_URL + "/#person";
export const WEBSITE_ID = SITE_URL + "/#website";

/** Pages about Karolina herself: Google reads them as profile pages. */
export const PROFILE_PAGES: ReadonlySet<View> = new Set([VIEW.work, VIEW.about]);
