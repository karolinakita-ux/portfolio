import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";
import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

export interface BreadcrumbItem {
  label: string;
  /** Required for every item except the last (current page). */
  view?: View;
  /** A section of that view to open at (its heading id), e.g. the case list on Work. */
  anchor?: string;
  icon?: IconComponent;
}

export interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  onNavigate: Navigate;
}
