import type { VIEW } from "./routes.constants.ts";

/** A view id: one of VIEW. */
export type View = (typeof VIEW)[keyof typeof VIEW];

export interface NavigateOptions {
  /** Glide to the top or the anchor instead of jumping (ignored with prefers-reduced-motion). */
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
