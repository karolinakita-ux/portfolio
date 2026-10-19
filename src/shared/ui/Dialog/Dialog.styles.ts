import { clsx } from "clsx";

export const styles = {
  /** Full-screen layer over the dimmed backdrop (dialog.css); the panel inside centres itself. */
  root: clsx(
    "kb-dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-start justify-center bg-transparent p-md open:flex md:p-xl",
  ),
};
