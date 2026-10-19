import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface WorkViewProps {
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}
