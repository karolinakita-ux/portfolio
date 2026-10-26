import { Fragment } from "react";

import { styles } from "./Eyebrow.styles.ts";
import type { EyebrowProps } from "./Eyebrow.types.ts";

/**
 * Uppercase Label Medium kicker. Parts are joined by a space and a bullet that CSS draws, with a comma as the
 * bullet's alternative text: screen readers say "Karolina Kita, Senior Product Designer", and the HTML text that
 * search engines, link previews and copy and paste read has no stray marks. Before 5.0.1 the bullet and a hidden
 * comma were text, which text-only readers saw as "Karolina Kita • , Senior Product Designer".
 */
export function Eyebrow({ parts, className }: EyebrowProps) {
  return (
    <p className={styles.root(className)}>
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 && " "}
          <span className={styles.part(index > 0)}>{part}</span>
        </Fragment>
      ))}
    </p>
  );
}
