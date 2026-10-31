import { Button } from "#shared/ui/Button/Button.tsx";
import { IconButton } from "#shared/ui/IconButton/IconButton.tsx";
import { X } from "#shared/ui/icons/icons.tsx";

import { styles } from "./LightboxHeader.styles.ts";
import type { LightboxHeaderProps } from "./LightboxHeader.types.ts";

/**
 * "2 / 7" (with more than one image), the image title, the close button and, for an image with a description on the
 * page, Go to Description (Figma: Image Viewer · Go to Description). Close comes first in the DOM, so showModal() puts
 * focus there and Tab goes on to Go to Description.
 */
export function LightboxHeader({ index, count, title, titleId, onClose, onGoToDescription }: LightboxHeaderProps) {
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
      </div>{" "}
      <div className={styles.controls}>
        {/* First focusable element, so showModal() puts focus here. */}
        <IconButton label="Close image viewer" icon={X} onClick={onClose} className={styles.close} />
        {onGoToDescription && (
          <div className={styles.description}>
            <Button variant="link" onClick={onGoToDescription}>
              Go to Description
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
