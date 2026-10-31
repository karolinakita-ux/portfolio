import { KEPT_PARAMS, LINK_REF } from "./analytics.constants.ts";
import { linkRef } from "./payload.utils.ts";

/** The UTM parameter that marks a copied section link when it keeps the copier's tag. */
const MEDIUM = "utm_medium";

/**
 * The query of a section link copied with the button beside its heading (HeadingAnchor), from the copier's own query.
 * Without a tag it is ?ref=section-link. A copier who came from a tagged link (?ref=acme, or utm_source) passes its
 * tags on, so a colleague's visit still counts for that company or channel (link-ref, the session's `ref`), and
 * utm_medium=section-link marks it as a shared section link in the UTM report. Nothing else in the address travels
 * (the click ids that ads and social apps add): only KEPT_PARAMS.
 */
export const sectionLinkQuery = (search: string): string => {
  const tag = linkRef(search);
  if (tag === null || tag === LINK_REF.sectionLink) return "?ref=" + LINK_REF.sectionLink;
  const kept = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) {
    if (KEPT_PARAMS.includes(key) && key !== MEDIUM) kept.append(key, value);
  }
  kept.set(MEDIUM, LINK_REF.sectionLink);
  return "?" + kept.toString();
};
