import type { AnchorHTMLAttributes, ReactNode } from "react";

import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";

export interface ViewLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  view: View;
  anchor?: string | null;
  onNavigate: Navigate;
  children: ReactNode;
}
