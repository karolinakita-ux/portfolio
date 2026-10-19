import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** lucide + lucide-<name>, as lucide-react names its icons, plus the caller's classes. */
  root: (name: string, className?: string) => cn("lucide", "lucide-" + name, className),
};
