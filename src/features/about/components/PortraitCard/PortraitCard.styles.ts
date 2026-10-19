import { clsx } from "clsx";

export const styles = {
  root: clsx("flex h-full min-w-0 flex-col gap-sm"),
  frame: clsx(
    "relative aspect-portrait w-full max-w-full overflow-hidden rounded-md border border-border-subtle bg-bg-avatar-base bg-portrait-glow shadow-sm md:aspect-auto md:min-h-0 md:flex-1",
  ),
  image: (loaded: boolean) =>
    clsx(
      "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-slow ease-standard",
      loaded ? "opacity-100" : "opacity-0",
    ),
  caption: clsx("text-center text-body-sm text-text-primary"),
  captionLine: clsx("block"),
};
