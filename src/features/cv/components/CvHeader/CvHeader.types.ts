import type { CvHeaderContent } from "#features/cv/cv.types.ts";
import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface CvHeaderProps {
  header: CvHeaderContent;
  onNavigate: Navigate;
}
