import type { CaseNavTarget } from "#features/case-studies/case-studies.types.ts";
import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";

export type CaseNavDirection = "prev" | "next";

/**
 * Where the link sits: `top` is the compact one beside the breadcrumb ("Next", the case name for screen
 * readers only), `end` the full one that closes the case study (action and case name).
 */
export type CaseNavPlace = "top" | "end";

export interface CaseNavLinkProps {
  /** The case study the link leaves. */
  from: View;
  target: CaseNavTarget;
  direction: CaseNavDirection;
  place: CaseNavPlace;
  onNavigate: Navigate;
}
