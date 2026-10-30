import { clsx } from "clsx";

export const styles = {
  /** One column on phones. Three columns: two from md (wide cards take a full row), three from lg. */
  list: (columns: 2 | 3) => clsx("grid list-none gap-md md:grid-cols-2", { "lg:grid-cols-3": columns === 3 }),
  /** The Card primitive (raised surface, hairline border), stretched to its row. */
  item: (wide: boolean) => clsx("h-full min-w-0", { "md:col-span-2": wide }),
  header: clsx("flex items-center justify-between gap-sm"),
  /** Decorative: the ordered list already gives the position. */
  number: clsx("text-label-md text-text-secondary tabular-nums"),
  title: clsx("text-title-md font-semibold text-text-primary"),
  body: clsx("text-body-md text-text-secondary"),
  visual: clsx("mt-auto pt-sm"),
  chips: clsx("flex list-none flex-wrap gap-xs"),
  check: clsx(
    "inline-flex items-center gap-2xs rounded-sm border border-border-subtle bg-bg-surface-default px-sm py-2xs text-label-md text-text-primary",
  ),
  checkIcon: clsx("shrink-0 text-status-success-text"),
  /** Label samples and swatches: their colours are content (inline style), the frame is the site's. */
  labels: clsx("grid list-none grid-cols-2 gap-sm"),
  label: clsx("flex flex-col gap-3xs rounded-sm border border-border-subtle p-sm"),
  labelSample: clsx("text-title-lg"),
  labelValue: clsx("font-mono text-label-sm"),
  swatches: clsx("grid list-none grid-cols-2 gap-sm sm:grid-cols-4"),
  swatch: clsx("flex min-w-0 flex-col gap-2xs"),
  swatchColor: clsx("h-2xl rounded-sm border border-border-subtle"),
  swatchLabel: clsx("text-label-md text-text-primary"),
  swatchRule: clsx("font-mono text-label-sm text-text-secondary"),
  /** Wraps instead of scrolling: no scroll region to reach by keyboard on small screens. */
  code: clsx(
    "rounded-sm border border-border-subtle bg-bg-surface-subtle p-md font-mono text-label-md break-words whitespace-pre-wrap text-text-primary",
  ),
  /** Figma's orange for property names; the link colour reached only 3.8:1 on the Dark code fill. */
  codeProperty: clsx("text-status-warning-text"),
  phases: clsx("flex items-start gap-sm"),
  phase: clsx("flex min-w-0 flex-col gap-3xs"),
  phaseEnd: clsx("flex min-w-0 flex-col items-end gap-3xs text-right"),
  phaseLabel: clsx("inline-flex items-center gap-xs text-label-lg text-text-primary"),
  phaseNote: clsx("text-label-md text-text-secondary"),
  dotShipped: clsx("size-xs shrink-0 rounded-full bg-status-success-text"),
  dotRoadmap: clsx("size-xs shrink-0 rounded-full bg-status-warning-text"),
  phaseLine: clsx("mt-xs h-3xs flex-1 rounded-full bg-border-subtle"),
};
