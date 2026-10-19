import { clsx } from "clsx";

export const styles = {
  /** lucide + lucide-<name>, as lucide-react names its icons, plus the caller's classes. */
  root: (name: string, className?: string) => clsx("lucide", "lucide-" + name, className),
};
