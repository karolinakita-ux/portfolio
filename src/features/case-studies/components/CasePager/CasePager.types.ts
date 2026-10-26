import type { CaseNavTarget } from "#features/case-studies/case-studies.types.ts";
import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";

export interface CasePagerProps {
  /** The case study these links leave. */
  from: View;
  prev?: CaseNavTarget;
  next?: CaseNavTarget;
  onNavigate: Navigate;
}
