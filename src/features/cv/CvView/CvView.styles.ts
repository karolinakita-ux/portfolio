import { clsx } from "clsx";

export const styles = {
  /** No page gutter or top space on paper: the PDF's margins frame the sheet. */
  root: clsx("pt-xl print:p-0"),
  crumbs: clsx("print:hidden"),
  /** The note, the download and the sheet share the sheet's width, centred. */
  column: clsx("mx-auto mt-xl flex max-w-sheet flex-col gap-lg print:mt-0 print:max-w-none"),
  toolbar: clsx("flex flex-col gap-md md:flex-row md:items-start md:justify-between print:hidden"),
  note: clsx("max-w-reading text-body-md text-text-secondary"),
};
