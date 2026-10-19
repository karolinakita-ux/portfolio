import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-xl print:p-0"),
  toolbar: clsx("flex flex-col gap-lg print:hidden"),
  toolbarRow: clsx("flex flex-col gap-md md:flex-row md:items-end md:justify-between"),
  note: clsx("flex flex-col gap-xs"),
  noteText: clsx("text-body-md text-text-secondary"),
  download: clsx("self-start md:self-auto"),
  sheet: clsx("mt-xl print:mt-0"),
};
