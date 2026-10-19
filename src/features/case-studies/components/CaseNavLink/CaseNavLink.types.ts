import type { CaseNavTarget } from "#features/case-studies/case-studies.types.ts";
import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";

export type CaseNavDirection = "prev" | "next";

export interface CaseNavLinkProps {
  /** The case study the link leaves. */
  from: View;
  target: CaseNavTarget;
  direction: CaseNavDirection;
  onNavigate: Navigate;
}
