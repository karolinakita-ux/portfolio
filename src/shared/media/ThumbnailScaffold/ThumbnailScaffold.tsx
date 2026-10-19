import { ImageOff } from "#shared/ui/icons/icons.tsx";

import { styles } from "./ThumbnailScaffold.styles.ts";
import type { ThumbnailScaffoldProps } from "./ThumbnailScaffold.types.ts";

/**
 * Geometric wireframe shown while a thumbnail loads, or if it fails.
 * While loading it pulses twice (2 x 2s) and then holds still, so nothing loops past 5 s on a
 * slow connection (WCAG 2.2.2).
 */
export function ThumbnailScaffold({ failed = false }: ThumbnailScaffoldProps) {
  return (
    <div aria-hidden="true" className={styles.root}>
      <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid meet" className={styles.wireframe(failed)}>
        <rect x="0.5" y="0.5" width="159" height="119" rx="4" className={styles.frame} />
        <rect x="0.5" y="0.5" width="159" height="14" rx="4" className={styles.titleBar} />
        <rect x="8" y="5" width="22" height="4" rx="2" className={styles.mark} />
        <circle cx="146" cy="7.5" r="3" className={styles.mark} />
        <rect x="8" y="22" width="30" height="90" rx="2" className={styles.panel} />
        <rect x="13" y="28" width="20" height="3" rx="1.5" className={styles.mark} />
        <rect x="13" y="36" width="16" height="3" rx="1.5" className={styles.line} />
        <rect x="13" y="44" width="18" height="3" rx="1.5" className={styles.line} />
        <rect x="46" y="22" width="60" height="6" rx="3" className={styles.mark} />
        <rect x="46" y="33" width="104" height="3" rx="1.5" className={styles.line} />
        <rect x="46" y="40" width="92" height="3" rx="1.5" className={styles.line} />
        <rect x="46" y="52" width="50" height="28" rx="2" className={styles.panel} />
        <rect x="100" y="52" width="50" height="28" rx="2" className={styles.panel} />
        <rect x="46" y="84" width="50" height="28" rx="2" className={styles.panel} />
        <rect x="100" y="84" width="50" height="28" rx="2" className={styles.accentPanel} />
      </svg>
      {failed && (
        <span className={styles.label}>
          <ImageOff aria-hidden="true" size={12} />
          Preview unavailable
        </span>
      )}
    </div>
  );
}
