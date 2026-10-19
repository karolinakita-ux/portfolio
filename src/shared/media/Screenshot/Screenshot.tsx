import { useState } from "react";

import { useImageStatus } from "#shared/media/image-status/useImageStatus.ts";
import { ThumbnailScaffold } from "#shared/media/ThumbnailScaffold/ThumbnailScaffold.tsx";
import { Maximize2 } from "#shared/ui/icons/icons.tsx";

import { styles } from "./Screenshot.styles.ts";
import type { ScreenshotProps } from "./Screenshot.types.ts";

/** Case-study screenshot at its natural aspect ratio (no cropping). */
export function Screenshot({ src, fallbackSrc, alt, onExpand }: ScreenshotProps) {
  // Which src failed: once the close-up fails, show the fallback for that src.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = fallbackSrc && failedSrc === src ? fallbackSrc : src;
  const { status, setStatus, ref } = useImageStatus(currentSrc);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) setFailedSrc(src);
    else setStatus("error");
  };

  if (status === "error") {
    return (
      <div className={styles.failed}>
        <ThumbnailScaffold failed />
        <span className={styles.srOnly}>{alt}</span>
      </div>
    );
  }

  const image = (
    <img
      ref={ref}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setStatus("loaded")}
      onError={handleError}
      className={styles.image(onExpand !== undefined)}
    />
  );

  if (!onExpand) return <div className={styles.frame}>{image}</div>;

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => onExpand(event.currentTarget)}
      className={styles.button}
    >
      <span className={styles.srOnly}>View full size: </span>
      {image}
      <span aria-hidden="true" className={styles.badge}>
        <Maximize2 size={12} />
        <span className={styles.badgeLabel}>View full size</span>
      </span>
    </button>
  );
}
