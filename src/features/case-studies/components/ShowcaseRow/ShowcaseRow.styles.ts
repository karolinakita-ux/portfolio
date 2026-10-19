import { clsx } from "clsx";

export const styles = {
  root: clsx("md:grid-cols-showcase"),
  body: clsx("flex min-w-0 flex-col gap-sm"),
  title: clsx("text-title-md text-balance text-text-primary"),
  intro: clsx("text-body-md text-text-secondary"),
  block: clsx("flex flex-col gap-2xs pt-xs"),
  blockTitle: clsx("text-title-md text-balance text-text-primary"),
  blockBody: clsx("text-body-md text-text-secondary"),
};
