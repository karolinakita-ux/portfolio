import { callout, styles } from "./Callout.styles.ts";
import type { CalloutProps } from "./Callout.types.ts";

const HEADINGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

/**
 * Callout / InfoBanner - status-tinted container (warning | info).
 * Plain usage: children render as one Body Large paragraph.
 * With `title`: Title Medium semibold heading (H3 unless `headingLevel` says otherwise), then children as
 * structured content.
 */
export function Callout({ tone, label, title, headingLevel = 3, children }: CalloutProps) {
  const Heading = HEADINGS[headingLevel];
  return (
    <aside aria-label={label} className={callout({ tone })}>
      {title ? (
        <div className={styles.titled}>
          <Heading className={styles.title}>{title}</Heading>
          {children}
        </div>
      ) : (
        <p>{children}</p>
      )}
    </aside>
  );
}
