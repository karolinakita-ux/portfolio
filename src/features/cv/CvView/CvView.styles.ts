import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("pt-xl print:p-0"),
  toolbar: cn("flex flex-col gap-lg print:hidden"),
  toolbarRow: cn("flex flex-col gap-md md:flex-row md:items-end md:justify-between"),
  note: cn("flex flex-col gap-xs"),
  noteText: cn("text-body-md text-text-secondary"),
  download: cn("self-start md:self-auto"),
  sheet: cn("mt-xl print:mt-0"),
};
