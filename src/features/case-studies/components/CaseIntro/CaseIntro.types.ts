import type { AnyCase } from "#features/case-studies/case-studies.types.ts";
import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface CaseIntroProps {
  c: AnyCase;
  onNavigate: Navigate;
}
