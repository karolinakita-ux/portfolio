import { clsx } from "clsx";

export const styles = {
  root: clsx("md:grid-cols-case-md lg:grid-cols-case-lg"),
  thumbnail: clsx("group/thumb relative w-full min-w-0"),
  thumbnailLink: clsx("absolute inset-0 rounded-md"),
  body: clsx("flex w-full min-w-0 flex-col items-start gap-xs"),
  /** Full column width; text-pretty only prevents a lone last word (no forced even split). */
  title: clsx("w-full text-title-md text-pretty text-text-primary"),
  summary: clsx("text-body-md text-text-secondary"),
  cta: clsx("mt-xs"),
};
