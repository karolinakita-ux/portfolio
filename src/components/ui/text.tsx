import type { ReactNode } from "react";
import type { CalloutTone } from "../../content/types.ts";
import { cn } from "../../lib/ui.ts";

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-text-primary">{children}</strong>;
}

/**
 * Inline phrase in another language (e.g. quoted Polish UI labels), so screen readers switch pronunciation
 * (WCAG 3.1.2 Language of Parts). Keep quote marks outside the span.
 */
export function Lang({ lang, children }: { lang: string; children: ReactNode }) {
  return <span lang={lang}>{children}</span>;
}

/** Inline colour chip for hex values quoted in copy (content data, not UI chrome). */
export function Swatch({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden="true"
      className="mr-2xs inline-block size-sm rounded-sm border border-border-subtle align-[-1px]"
      style={{ backgroundColor: hex }}
    />
  );
}

/** Status callout - tone maps to the status* token family. */
const CALLOUT_TONES: Record<CalloutTone, string> = {
  warning: "border-status-warning-border bg-status-warning-surface text-status-warning-text",
  info: "border-status-info-border bg-status-info-surface text-status-info-text",
};

interface CalloutProps {
  tone: CalloutTone;
  /** Accessible name of the <aside>. */
  label: string;
  title?: string;
  children: ReactNode;
}

/**
 * Callout / InfoBanner - status-tinted container (warning | info).
 * Plain usage: children render as one Body Large paragraph.
 * With `title`: Title Medium semibold heading, then children as structured content.
 */
export function Callout({ tone, label, title, children }: CalloutProps) {
  return (
    <aside aria-label={label} className={cn("rounded-md border p-lg text-body-lg", CALLOUT_TONES[tone])}>
      {title ? (
        <div className="flex flex-col gap-sm">
          <h3 className="text-title-md font-semibold">{title}</h3>
          {children}
        </div>
      ) : (
        <p>{children}</p>
      )}
    </aside>
  );
}
