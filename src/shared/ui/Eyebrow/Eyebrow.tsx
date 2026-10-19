import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { styles } from "./Eyebrow.styles.ts";
import type { EyebrowProps } from "./Eyebrow.types.ts";

/** Uppercase Label Medium kicker; parts are joined by a decorative bullet (a comma for screen readers). */
export function Eyebrow({ parts, className }: EyebrowProps) {
  return (
    <p className={styles.root(className)}>
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 && (
            <>
              <span aria-hidden="true"> • </span>
              <VisuallyHidden>, </VisuallyHidden>
            </>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}
