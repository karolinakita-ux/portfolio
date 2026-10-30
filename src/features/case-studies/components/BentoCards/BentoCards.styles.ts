import { clsx } from "clsx";

export const styles = {
  /** One column on phones. Three columns: two from md (wide cards take a full row), three from lg. */
  list: (columns: 2 | 3) => clsx("grid list-none gap-md md:grid-cols-2", { "lg:grid-cols-3": columns === 3 }),
  /** The Card primitive (raised surface, hairline border), stretched to its row. */
  item: (wide: boolean) => clsx("h-full min-w-0", { "md:col-span-2": wide }),
  header: clsx("flex items-center justify-between gap-sm"),
  /** The card's number: hidden from screen readers in a list from 01, read out in a continued one (BentoCards). */
  number: clsx("text-label-md text-text-secondary tabular-nums"),
  title: clsx("text-title-md font-semibold text-text-primary"),
  body: clsx("text-body-md text-text-secondary"),
  /** The card's small visual (BentoVisual) sits at its foot. */
  visual: clsx("mt-auto pt-sm"),
};
