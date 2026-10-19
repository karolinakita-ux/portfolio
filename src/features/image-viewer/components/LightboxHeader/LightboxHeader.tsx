import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { X } from "#shared/ui/icons/icons.tsx";

import { styles } from "./LightboxHeader.styles.ts";
import type { LightboxHeaderProps } from "./LightboxHeader.types.ts";

/** "2 / 7" (with more than one image), the image title, and the close button. */
export function LightboxHeader({ index, count, title, titleId, closeRef, onClose }: LightboxHeaderProps) {
  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        {count > 1 && (
          <p className={styles.counter}>
            {index + 1} / {count}
          </p>
        )}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </div>
      {/* First focusable element, so showModal() puts focus here. */}
      <IconButton ref={closeRef} label="Close image viewer" icon={X} onClick={onClose} />
    </div>
  );
}
