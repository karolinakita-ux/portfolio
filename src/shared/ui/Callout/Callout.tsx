import { styles } from "./Callout.styles.ts";
import type { CalloutProps } from "./Callout.types.ts";

/**
 * Callout / InfoBanner - status-tinted container (warning | info).
 * Plain usage: children render as one Body Large paragraph.
 * With `title`: Title Medium semibold heading, then children as structured content.
 */
export function Callout({ tone, label, title, children }: CalloutProps) {
  return (
    <aside aria-label={label} className={styles.root(tone)}>
      {title ? (
        <div className={styles.titled}>
          <h3 className={styles.title}>{title}</h3>
          {children}
        </div>
      ) : (
        <p>{children}</p>
      )}
    </aside>
  );
}
