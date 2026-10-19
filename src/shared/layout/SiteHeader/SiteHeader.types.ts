import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";

export interface SiteHeaderProps {
  activeView: View;
  onNavigate: Navigate;
  onHome: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}
