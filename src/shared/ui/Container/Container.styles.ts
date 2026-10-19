import { clsx } from "clsx";

export const styles = {
  root: (className?: string) => clsx("px-lg md:px-2xl lg:px-4xl", className),
  column: clsx("mx-auto w-full max-w-content"),
};
