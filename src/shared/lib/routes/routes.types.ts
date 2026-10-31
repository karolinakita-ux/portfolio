import type { VIEW } from "./routes.constants.ts";

/** A view id: one of VIEW. */
export type View = (typeof VIEW)[keyof typeof VIEW];

/** A case study's view (case-automotive, ...): isCaseView() in routes.utils.ts tells them apart. */
export type CaseView = Extract<View, `case-${string}`>;

/** The names of one case study, each written once in CASE_NAMES (routes.content.ts) and read from there. */
export interface CaseNames {
  /** The page's H1, and the name its previous / next links give it (CaseNavLink). */
  title: string;
  /** Its Work card's heading, and its name in llms.txt and in its structured data (CreativeWork). */
  cardTitle: string;
  /** Its breadcrumb, on the page and in the structured data, and its browser tab ("… Case Study - Karolina Kita"). */
  shortTitle: string;
}

export interface NavigateOptions {
  /**
   * Glide to the top or the anchor instead of jumping, within the same view only: a new view always starts there
   * at once (ignored with prefers-reduced-motion too).
   */
  smooth?: boolean;
}

/** Navigate to a view; `anchor` is a section id to land on instead of the top. */
export type Navigate = (view: View, anchor?: string | null, options?: NavigateOptions) => void;

export interface LocationRoute {
  /** null: the path names no view. */
  view: View | null;
  /** Section id from the hash, or null. */
  anchor: string | null;
}

export type PathAndHash = Pick<Location, "pathname" | "hash">;

export interface NavItem {
  view: View;
  label: string;
}
