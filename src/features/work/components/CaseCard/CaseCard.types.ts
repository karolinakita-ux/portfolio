import type { WorkCase } from "#features/work/work.types.ts";
import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface CaseCardProps {
  item: WorkCase;
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}
